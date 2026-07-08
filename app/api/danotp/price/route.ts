import { NextResponse } from 'next/server';
import { danotpRequest } from '@/lib/danotp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const country = searchParams.get('country');
    const areacode = searchParams.get('areacode');
    const pool = searchParams.get('pool');

    const params: any = { service, country };
    if (areacode) params.areacode = areacode;
    if (pool) params.pool = pool;

    const data = await danotpRequest('getPrice', params);
    return NextResponse.json({ success: true, price: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
