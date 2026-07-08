import { NextResponse } from 'next/server';
import { danotpRequest } from '@/lib/danotp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    const data = await danotpRequest('getAreaCodes', { country });
    return NextResponse.json({ success: true, areaCodes: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
