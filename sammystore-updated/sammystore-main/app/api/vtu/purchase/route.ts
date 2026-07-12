import { NextResponse } from 'next/server';
import { clubkonnectRequest } from '@/lib/clubkonnect';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getUserId } from '@/lib/auth';
import { getMarkups, computeMarkup } from '@/lib/pricing';

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Please login' }, { status: 401 });

  const { service_type, network, phone, plan_id } = await request.json();
  if (!service_type || !network || !phone || !plan_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.suspended) return NextResponse.json({ error: 'Your account is suspended. Contact support.' }, { status: 403 });

  try {
    const plans = await clubkonnectRequest('/plans', { type: service_type, network });
    const plan = plans.find((p: any) => p.id === plan_id);

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const basePrice = parseFloat(String(plan.price));
    if (isNaN(basePrice) || basePrice <= 0) {
      return NextResponse.json({ error: 'Invalid plan price' }, { status: 500 });
    }
    const markups = await getMarkups();
    const price = computeMarkup(basePrice, markups.vtu);

    // Atomic check-and-deduct - see note in numbers/tiger/buy for why this
    // has to be a single conditional update rather than read-then-save.
    const debited = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: price } },
      { $inc: { walletBalance: -price } },
      { new: true }
    );

    if (!debited) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    let purchase;
    try {
      purchase = await clubkonnectRequest('/purchase', {
        service_type,
        network,
        phone,
        plan_id,
        request_id: Date.now().toString()
      });
    } catch (providerError: any) {
      await User.findByIdAndUpdate(userId, { $inc: { walletBalance: price } });
      return NextResponse.json({ error: `Purchase failed: ${providerError.message}` }, { status: 400 });
    }

    try {
      await Transaction.create({
        userId,
        type: 'vtu',
        description: `VTU: ${network} ${service_type} for ${phone}`,
        amount: price,
        status: 'success'
      });
    } catch (txError) {
      console.error('Failed to record VTU transaction after successful purchase:', txError);
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase successful',
      newBalance: debited.walletBalance
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
