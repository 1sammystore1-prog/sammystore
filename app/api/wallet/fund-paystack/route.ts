import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { email, amount, userId } = await request.json();
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) return NextResponse.json({ success: false, error: 'Paystack key missing' });

    // Call Paystack to initialize transaction
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: email,
      amount: amount * 100, // Paystack uses kobo
      reference: `SAMMY-${Date.now()}`,
      metadata: { userId: userId }
    }, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });

    return NextResponse.json({ success: true, url: response.data.data.authorization_url });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Payment initialization failed' });
  }
}
