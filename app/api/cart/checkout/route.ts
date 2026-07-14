import { NextResponse } from 'next/server';
import { buyAccountsRequest } from '@/lib/buyaccounts';
import { japRequest } from '@/lib/jap';
import { getUserId } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Cart from '@/models/Cart';
import { getMarkups, computeMarkup, toNgn } from '@/lib/pricing';

function extractProducts(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.categories)) {
      return data.categories.flatMap((c: any) =>
        Array.isArray(c.products) ? c.products.map((p: any) => ({ ...p, category: c.name })) : []
      );
    }
    if (Array.isArray(data.products)) return data.products;
    if (data.product && typeof data.product === 'object') return [data.product];
  }
  return [];
}

type CheckoutResult = { productId: string; name: string; success: boolean; error?: string };

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' }, { status: 401 });

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  if (user.suspended) {
    return NextResponse.json({ success: false, error: 'Your account is suspended. Contact support.' }, { status: 403 });
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ success: false, error: 'Your cart is empty' }, { status: 400 });
  }

  const accountItems = cart.items.filter((i) => i.type !== 'smm');
  const smmItems = cart.items.filter((i) => i.type === 'smm');

  const markups = await getMarkups();
  const results: CheckoutResult[] = [];
  const remainingItems: typeof cart.items = [];

  if (accountItems.length > 0) {
    let liveProducts: any[] = [];
    try {
      const productData = await buyAccountsRequest('getProducts');
      liveProducts = extractProducts(productData);
    } catch {}

    for (const item of accountItems) {
      const liveProduct = liveProducts.find((p: any) => String(p.id) === String(item.productId));

      if (!liveProduct) {
        results.push({ productId: item.productId, name: item.name, success: false, error: 'No longer available' });
        remainingItems.push(item);
        continue;
      }

      const baseUnitPrice = parseFloat(String(liveProduct.price));
      if (isNaN(baseUnitPrice) || baseUnitPrice <= 0) {
        results.push({ productId: item.productId, name: item.name, success: false, error: 'Invalid product price' });
        remainingItems.push(item);
        continue;
      }

      const unitPrice = computeMarkup(baseUnitPrice, markups.accounts);
      const cost = unitPrice * item.quantity;

      const debited = await User.findOneAndUpdate(
        { _id: userId, walletBalance: { $gte: cost } },
        { $inc: { walletBalance: -cost } },
        { new: true }
      );

      if (!debited) {
        results.push({ productId: item.productId, name: item.name, success: false, error: 'Insufficient funds' });
        remainingItems.push(item);
        continue;
      }

      let data;
      try {
        data = await buyAccountsRequest('buyProduct', { id: item.productId, amount: item.quantity, coupon: '' });
      } catch {
        await User.findByIdAndUpdate(userId, { $inc: { walletBalance: cost } });
        results.push({ productId: item.productId, name: item.name, success: false, error: 'Purchase failed, refunded' });
        remainingItems.push(item);
        continue;
      }

      try {
        await Transaction.create({
          userId,
          type: 'account_purchase',
          description: `Bought ${item.quantity} x ${item.name}`,
          amount: cost,
          status: 'success',
          metadata: {
            productId: item.productId,
            productName: item.name,
            category: item.category || null,
            quantity: item.quantity,
            accountData: data,
          },
        });
      } catch (txError) {
        console.error('Failed to record account Transaction after successful purchase:', txError);
      }

      results.push({ productId: item.productId, name: item.name, success: true });
    }
  }

  if (smmItems.length > 0) {
    let liveServices: any[] = [];
    try {
      const smmData = await japRequest('services');
      liveServices = Array.isArray(smmData) ? smmData : [];
    } catch {}

    for (const item of smmItems) {
      const liveService = liveServices.find((s: any) => String(s.service) === String(item.productId));

      if (!liveService) {
        results.push({ productId: item.productId, name: item.name, success: false, error: 'Service no longer available' });
        remainingItems.push(item);
        continue;
      }

      const baseCostUsd = (parseFloat(liveService.rate) * item.quantity) / 1000;
      if (isNaN(baseCostUsd) || baseCostUsd <= 0) {
        results.push({ productId: item.productId, name: item.name, success: false, error: 'Invalid price' });
        remainingItems.push(item);
        continue;
      }
      const cost = computeMarkup(toNgn(baseCostUsd), markups.smm);

      const debited = await User.findOneAndUpdate(
        { _id: userId, walletBalance: { $gte: cost } },
        { $inc: { walletBalance: -cost } },
        { new: true }
      );

      if (!debited) {
        results.push({ productId: item.productId, name: item.name, success: false, error: 'Insufficient funds' });
        remainingItems.push(item);
        continue;
      }

      let order;
      try {
        order = await japRequest('add', {
          service: item.productId,
          link: item.link,
          quantity: item.quantity.toString(),
        });
      } catch (providerError: any) {
        await User.findByIdAndUpdate(userId, { $inc: { walletBalance: cost } });
        results.push({ productId: item.productId, name: item.name, success: false, error: 'Order failed, refunded' });
        remainingItems.push(item);
        continue;
      }

      try {
        await Transaction.create({
          userId,
          type: 'smm',
          description: `SMM order: ${item.name} x${item.quantity}`,
          amount: cost,
          status: 'success',
          activationId: String(order.order),
        });
      } catch (txError) {
        console.error('Failed to record SMM Transaction after successful order:', txError);
      }

      results.push({ productId: item.productId, name: item.name, success: true });
    }
  }

  cart.items = remainingItems;
  await cart.save();

  const finalUser = await User.findById(userId);
  const allSucceeded = results.every((r) => r.success);

  return NextResponse.json({
    success: allSucceeded,
    partial: !allSucceeded && results.some((r) => r.success),
    results,
    newBalance: finalUser?.walletBalance ?? null,
  });
}
