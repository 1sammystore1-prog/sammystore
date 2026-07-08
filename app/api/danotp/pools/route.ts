import { NextResponse } from 'next/server';
import { danotpRequest } from '@/lib/danotp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const service = searchParams.get('service');

    const data = await danotpRequest('getPools', { country, service });
    return NextResponse.json({ success: true, pools: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
