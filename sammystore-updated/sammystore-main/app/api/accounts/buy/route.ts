import { NextResponse } from 'next/server';
import { buyAccountsRequest } from '@/lib/buyaccounts';
import { getUserId } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getMarkups, computeMarkup } from '@/lib/pricing';

function extractProducts(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.categories)) {
      return data.categories.flatMap((c: any) => Array.isArray(c.products) ? c.products : []);
    }
    if (Array.isArray(data.products)) return data.products;
    if (data.product && typeof data.product === 'object') return [data.product];
  }
  return [];
}

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' }, { status: 401 });

  const { productId, amount, coupon } = await request.json();
  const qty = parseInt(String(amount)) || 1;
  if (!productId || qty <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  if (user.suspended) return NextResponse.json({ success: false, error: 'Your account is suspended. Contact support.' }, { status: 403 });

  try {
    // Look up the product's real price from the provider ourselves - never
    // trust a client-supplied price, which would let anyone pay whatever
    // amount they choose for an account.
    const productData = await buyAccountsRequest('getProducts');
    const products = extractProducts(productData);
    const product = products.find((p: any) => String(p.id) === String(productId));

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 400 });
    }

    const baseUnitPrice = parseFloat(String(product.price));
    if (isNaN(baseUnitPrice) || baseUnitPrice <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid product price' }, { status: 500 });
    }

    const markups = await getMarkups();
    const unitPrice = computeMarkup(baseUnitPrice, markups.accounts);
    const cost = unitPrice * qty;

    // Atomic check-and-deduct to close the same double-spend race the other
    // purchase routes had.
    const debited = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: cost } },
      { $inc: { walletBalance: -cost } },
      { new: true }
    );

    if (!debited) {
      return NextResponse.json({ success: false, error: 'Insufficient funds' }, { status: 400 });
    }

    try {
      const data = await buyAccountsRequest('buyProduct', {
        id: productId,
        amount: qty,
        coupon: coupon || ''
      });

      await Transaction.create({
        userId,
        type: 'account_purchase',
        description: `Bought account ID ${productId}`,
        amount: cost,
        status: 'success'
      });

      return NextResponse.json({
        success: true,
        message: 'Purchase successful!',
        accountData: data,
        newBalance: debited.walletBalance
      });
    } catch (providerError) {
      // Refund since the provider purchase failed after we'd already debited.
      await User.findByIdAndUpdate(userId, { $inc: { walletBalance: cost } });
      return NextResponse.json({ success: false, error: 'Purchase failed' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
