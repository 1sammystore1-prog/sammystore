import { NextResponse } from 'next/server';
import { getAll1Pools } from '@/lib/benotp';

export const dynamic = 'force-dynamic';

// all1-only: lists every pool that can fulfil a given service+country
// (+optional areacode) with its own price/stock, so the frontend can let
// the customer pick a pool instead of always buying whatever pool the
// account defaults to.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get('service');
  const country = searchParams.get('country');
  const areaCode = searchParams.get('areacode') || undefined;

  if (!service || !country) {
    return NextResponse.json(
      { success: false, error: 'service and country are required' },
      { status: 400 }
    );
  }

  try {
    const pools = await getAll1Pools(service, country, areaCode);
    return NextResponse.json({ success: true, pools });
  } catch (e: any) {
    console.error('BenOTP getPools (all1) error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to load pool list' },
      { status: 500 }
    );
  }
}
