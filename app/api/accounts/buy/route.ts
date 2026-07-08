import { NextResponse } from 'next/server';
import { buyAccountsRequest } from '@/lib/buyaccounts';
import { getUserId } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' });

  const { productId, amount, coupon, price } = await request.json();
  const qty = amount || 1;
  const cost = price * qty;

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ success: false, error: 'User not found' });
  if (user.walletBalance < cost) return NextResponse.json({ success: false, error: 'Insufficient funds' });

  // 1. Deduct Money
  user.walletBalance -= cost;
  await user.save();

  // 2. Call DanOTP API
  try {
    const data = await buyAccountsRequest('buyProduct', { 
      id: productId, 
      amount: qty, 
      coupon: coupon || '' 
    });

    // 3. Save Transaction
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
      newBalance: user.walletBalance 
    });
  } catch (error) {
    // Refund on failure
    user.walletBalance += cost;
    await user.save();
    return NextResponse.json({ success: false, error: 'Purchase failed' });
  }
}
