import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getUserId } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  await dbConnect();

  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' }, { status: 401 });

  // Limit brute-force attempts against the current-password check, same
  // idea as the login rate limiter but scoped to this account only.
  const limit = await checkRateLimit(`change-password:user:${userId}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ success: false, error: 'Please fill all fields' }, { status: 400 });
  }
  if (String(newPassword).length < 8) {
    return NextResponse.json({ success: false, error: 'New password must be at least 8 characters' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
  }

  if (currentPassword === newPassword) {
    return NextResponse.json({ success: false, error: 'New password must be different from the current password' }, { status: 400 });
  }

  // Pass the PLAIN new password - the schema's pre('save') hook hashes it
  // exactly once (see models/User.ts). Hashing it here too would
  // double-hash it and break future logins.
  user.password = newPassword;
  await user.save();

  return NextResponse.json({ success: true, message: 'Password updated successfully' });
}
