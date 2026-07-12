import { NextResponse } from 'next/server';
import { japRequest } from '@/lib/jap';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getUserId } from '@/lib/auth';
import { getMarkups, computeMarkup } from '@/lib/pricing';

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Please login' }, { status: 401 });

  const { service, link, quantity } = await request.json();
  const qty = parseInt(String(quantity));
  if (!service || !link || isNaN(qty) || qty <= 0) {
    return NextResponse.json({ error: 'Invalid order details' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.suspended) return NextResponse.json({ error: 'Your account is suspended. Contact support.' }, { status: 403 });

  try {
    const services = await japRequest('services');
    const selectedService = services.find((s: any) => s.service === parseInt(service));

    if (!selectedService) {
      return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
    }

    const baseCost = (selectedService.rate * qty) / 1000;
    const markups = await getMarkups();
    const cost = computeMarkup(baseCost, markups.smm);
    if (isNaN(cost) || cost <= 0) {
      return NextResponse.json({ error: 'Invalid cost calculation' }, { status: 500 });
    }

    // Atomic check-and-deduct so two concurrent orders can never both pass
    // the balance check against the same starting balance (the previous
    // read-then-save pattern allowed exactly that double-spend).
    const debited = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: cost } },
      { $inc: { walletBalance: -cost } },
      { new: true }
    );

    if (!debited) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // Place order with the provider. If this fails, refund immediately.
    let order;
    try {
      order = await japRequest('add', {
        service,
        link,
        quantity: qty.toString()
      });
    } catch (providerError: any) {
      await User.findByIdAndUpdate(userId, { $inc: { walletBalance: cost } });
      return NextResponse.json({ error: `Order failed: ${providerError.message}` }, { status: 400 });
    }

    try {
      await Transaction.create({
        userId,
        type: 'smm',
        description: `SMM order: ${selectedService.name || service} x${qty}`,
        amount: cost,
        status: 'success',
        activationId: String(order.order)
      });
    } catch (txError) {
      console.error('Failed to record SMM transaction after successful order:', txError);
      // The order already went through with the provider; refunding here
      // would let the user get the service for free, so we only log this
      // for manual reconciliation rather than refunding.
    }

    return NextResponse.json({
      success: true,
      orderId: order.order,
      newBalance: debited.walletBalance
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
