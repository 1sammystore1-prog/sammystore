import { NextResponse } from 'next/server';
import { getServices } from '@/lib/benotp';
import { getMarkups, computeMarkup } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

// Live catalog + pricing for usa1/usa2 only. all1/all2 aren't covered here -
// all1 has no bulk "browse all services" action (see /api/numbers/benotp/price
// for its single service+country lookup instead), and all2's getPrices
// response was confirmed malformed on BenOTP's side as of 2026-07-18, so it
// stays on the flat admin-set price from getBenotpPrices() until that's
// resolved.
export async function GET(req: Request) {
  const pool = new URL(req.url).searchParams.get('pool');
  if (pool !== 'usa1' && pool !== 'usa2') {
    return NextResponse.json(
      { success: false, error: 'pool must be usa1 or usa2' },
      { status: 400 }
    );
  }

  try {
    const [services, markups] = await Promise.all([getServices(pool), getMarkups()]);

    const withNgnPrice = services
      .map((s) => ({
        ...s,
        // BenOTP returns `price` already in NGN (not USD) - do NOT wrap
        // this in toNgn(), or it gets multiplied by USD_TO_NGN_RATE again
        // and inflates every price ~1550x (e.g. a real ₦3,700 service was
        // showing as ₦6,877,012).
        priceNgn: computeMarkup(s.price, markups.numbers),
      }))
      .sort((a, b) => a.priceNgn - b.priceNgn);

    return NextResponse.json({ success: true, pool, services: withNgnPrice });
  } catch (e: any) {
    console.error(`BenOTP getServices (${pool}) error:`, e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to load services' },
      { status: 500 }
    );
  }
}
