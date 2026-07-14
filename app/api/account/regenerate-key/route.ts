import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getUserId } from '@/lib/auth';

export async function POST(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' }, { status: 401 });

  // Cryptographically random, same scheme as registration - this key is
  // handed to the user directly, so it needs to be unguessable.
  const apiKey = 'sammy_' + crypto.randomBytes(20).toString('hex');

  const user = await User.findByIdAndUpdate(userId, { $set: { apiKey } }, { new: true });
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  return NextResponse.json({ success: true, apiKey: user.apiKey });
}
