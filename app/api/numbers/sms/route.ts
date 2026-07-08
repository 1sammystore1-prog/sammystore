import { NextResponse } from 'next/server';
import { danotpRequest } from '@/lib/danotp';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    const data = await danotpRequest('getStatus', { order_id: orderId });

    if (data.includes('STATUS:1:')) {
      const code = data.split(':')[2];
      return NextResponse.json({ success: true, sms: code });
    } else if (data.includes('STATUS:2')) {
      return NextResponse.json({ success: false, error: 'Waiting for SMS...' });
    } else if (data.includes('STATUS:3')) {
      return NextResponse.json({ success: false, error: 'SMS Timed Out' });
    } else {
      return NextResponse.json({ success: false, error: data });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
