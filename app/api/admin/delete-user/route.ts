import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  await dbConnect();
  const { userId } = await request.json();

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Delete user and their transactions
  await User.findByIdAndDelete(userId);
  await Transaction.deleteMany({ userId });

  return NextResponse.json({ success: true, message: 'User deleted' });
}
