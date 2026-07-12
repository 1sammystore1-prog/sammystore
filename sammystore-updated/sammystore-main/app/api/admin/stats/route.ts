import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await dbConnect();
  const totalUsers = await User.countDocuments();
  const users = await User.find();
  const totalWalletBalance = users.reduce((acc, user) => acc + (parseFloat(String(user.walletBalance)) || 0), 0);
  const totalTransactions = await Transaction.countDocuments();

  return NextResponse.json({ success: true, totalUsers, totalWalletBalance, totalTransactions });
}
