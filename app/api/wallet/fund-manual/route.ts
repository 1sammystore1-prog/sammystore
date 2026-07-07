import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, userId, reference } = await request.json();
    
    // In a real app, you would save this to your MongoDB 'Transactions' database here.
    // For now, we just return success so the UI updates.
    
    return NextResponse.json({ 
      success: true, 
      message: 'Manual transfer request submitted. Admin will verify.' 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' });
  }
}
