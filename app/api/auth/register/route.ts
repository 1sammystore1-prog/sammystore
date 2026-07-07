import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { name, email, password } = body;

    // Validate fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Please fill all fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Generate API key
    const apiKey = 'sammy_' + Math.random().toString(36).substring(2, 15);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password,
      apiKey,
      walletBalance: 0
    });

    // Return success
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
