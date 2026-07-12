import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await dbConnect();
  const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(200);
  return NextResponse.json({ success: true, transactions });
}
