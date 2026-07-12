import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { getUserId } from '@/lib/auth';

export async function GET(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch the last 50 transactions for this user, sorted by newest first
  const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(50);

  return NextResponse.json({ success: true, transactions });
}
