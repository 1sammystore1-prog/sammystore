import { NextResponse } from 'next/server';
import { danotpRequest } from '@/lib/danotp';

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json();
    const data = await danotpRequest('setStatus', { order_id: orderId, status });

    if (data.includes('OK')) {
      return NextResponse.json({ success: true, message: 'Status updated' });
    } else {
      return NextResponse.json({ success: false, error: data });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
