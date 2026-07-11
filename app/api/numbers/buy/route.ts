import { NextResponse } from 'next/server';
import { fiveSimRequest } from '@/lib/5sim';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getUserId } from '@/lib/auth';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Please login' }, { status: 401 });

  const { country, product } = await request.json();
  if (!country || !product) {
    return NextResponse.json({ error: 'Country and product are required' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  try {
    // 5sim Buy Endpoint: /v1/user/buy/activation/{country}/{operator}/{product}
    const activation = await fiveSimRequest(`/user/buy/activation/${country}/any/${product}`);

    // 5sim returns the price in the response
    const priceInUsd = activation.cost || activation.price || 0;
    const priceInNgn = priceInUsd * 1500; // Convert USD to NGN

    if (user.walletBalance < priceInNgn) {
      return NextResponse.json({ error: `Insufficient funds. You need ₦${priceInNgn.toFixed(2)}` }, { status: 400 });
    }

    // Deduct money and save transaction
    user.walletBalance -= priceInNgn;
    await user.save();

    await Transaction.create({
      userId,
      type: 'virtual_number',
      description: `Bought ${product} number for ${country} - Order ID: ${activation.id}, Phone: ${activation.phone}`,
      amount: priceInNgn,
      status: 'success'
    });

    return NextResponse.json({ 
      success: true, 
      orderId: activation.id,
      phoneNumber: activation.phone,
      price: priceInNgn,
      newBalance: user.walletBalance
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.response?.data?.error || error.message || 'Failed to buy number' 
    }, { status: 500 });
  }
}
