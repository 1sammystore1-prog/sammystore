import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET() {
  await dbConnect();
  const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(200);
  return NextResponse.json({ success: true, transactions });
}
