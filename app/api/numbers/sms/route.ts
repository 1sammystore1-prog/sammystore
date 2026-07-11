import { NextResponse } from 'next/server';
import { fiveSimRequest } from '@/lib/5sim';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
  }

  try {
    // 5sim Check Endpoint: /v1/user/check/{id}
    const data = await fiveSimRequest(`/user/check/${orderId}`);
    
    return NextResponse.json({ 
      success: true, 
      sms: data.sms || null,
      status: data.status
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message
    }, { status: 500 });
  }
}
