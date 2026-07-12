import { NextResponse } from 'next/server';
import { buyNumber, getServices } from '@/lib/tigerSms';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getUserId } from '@/lib/auth';

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { country, service } = await request.json();
  if (!country || !service) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  try {
    // Get live price for accurate deduction
    const services = await getServices(country);
    const selected = services.find(s => s.service === service);
    if (!selected) return NextResponse.json({ error: 'Service unavailable' }, { status: 400 });
    
    // FIX #3: Proper decimal handling for price conversion
    const priceNgn = parseFloat((selected.price * 1550).toFixed(2));
    
    // FIX #4: Defensive check - ensure price is valid
    if (isNaN(priceNgn) || priceNgn <= 0) {
      return NextResponse.json({ error: 'Invalid price calculation' }, { status: 500 });
    }
    
    // FIX #1 & #4: Validate balance with precision
    const currentBalance = parseFloat(String(user.walletBalance)) || 0;
    if (currentBalance < priceNgn) 
      return NextResponse.json({ error: `Insufficient funds. Need ₦${priceNgn.toFixed(2)}, Have ₦${currentBalance.toFixed(2)}` }, { status: 400 });

    // FIX #2: Try to buy number BEFORE deducting wallet
    let order;
    try {
      order = await buyNumber(country, service);
    } catch (buyError: any) {
      // If buyNumber fails, wallet is NOT deducted
      return NextResponse.json({ 
        success: false, 
        error: `Failed to provision number: ${buyError.message}` 
      }, { status: 400 });
    }

    // FIX #1: Only deduct wallet AFTER successful purchase
    user.walletBalance = currentBalance - priceNgn;
    
    // FIX #4: Validate balance after update
    if (user.walletBalance < 0) {
      // Safety check - should never happen, but protect against logic errors
      user.walletBalance = currentBalance; // Rollback
      throw new Error('Wallet balance validation failed after deduction');
    }
    
    await user.save();

    // FIX #2: Record transaction with success
    await Transaction.create({
      userId, 
      type: 'virtual_number', 
      description: `TigerSMS: ${order.number} (${service} - ${country})`, 
      amount: priceNgn, 
      status: 'success'
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id, 
      phoneNumber: order.number, 
      priceNgn, 
      newBalance: user.walletBalance 
    });
  } catch (e: any) {
    // Log error for debugging
    console.error('Buy number error:', e);
    return NextResponse.json({ 
      success: false, 
      error: e.message || 'Internal server error' 
    }, { status: 500 });
  }
}
