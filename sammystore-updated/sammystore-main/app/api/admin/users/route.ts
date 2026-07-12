import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await dbConnect();
  const users = await User.find().select('name email walletBalance suspended suspendReason createdAt');
  return NextResponse.json({ success: true, users });
}
