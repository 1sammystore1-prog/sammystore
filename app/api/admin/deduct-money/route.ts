import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  await dbConnect();
  const { userId, amount, reason } = await request.json();
  
  const validAmount = parseFloat(String(amount));
  if (isNaN(validAmount) || validAmount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const currentBalance = parseFloat(String(user.walletBalance)) || 0;
  if (currentBalance < validAmount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  user.walletBalance = currentBalance - validAmount;
  if (isNaN(user.walletBalance)) user.walletBalance = 0;
  await user.save();

  await Transaction.create({
    userId,
    type: 'admin_debit',
    description: `Admin debit: ${reason || 'Manual deduction'}`,
    amount: validAmount,
    status: 'success'
  });

  return NextResponse.json({ success: true, newBalance: user.walletBalance });
}
