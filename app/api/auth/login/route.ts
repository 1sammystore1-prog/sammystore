import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  await dbConnect();
  const { email, password } = await request.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Check if user is suspended
  if (user.suspended) {
    return NextResponse.json({ 
      error: `Account suspended. Reason: ${user.suspendReason || 'No reason provided'}` 
    }, { status: 403 });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  return NextResponse.json({
    success: true,
    token,
    user: { name: user.name, email: user.email, apiKey: user.apiKey, walletBalance: user.walletBalance }
  });
}
