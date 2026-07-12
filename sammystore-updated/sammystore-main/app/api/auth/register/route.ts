import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const ip = getClientIp(request);
    // Registration is cheap to abuse (spam accounts, enumeration probing),
    // so it gets its own limit separate from login.
    const limit = await checkRateLimit(`register:ip:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Please fill all fields' }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(email))) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Cryptographically random, not Math.random() - this is handed to the
    // user as their API key, so it needs to be unguessable.
    const apiKey = 'sammy_' + crypto.randomBytes(20).toString('hex');
    
    // Hash password manually before creating user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      apiKey,
      walletBalance: 0
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ 
      error: error.message || 'Server error' 
    }, { status: 500 });
  }
}
