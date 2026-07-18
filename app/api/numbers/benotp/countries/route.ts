import { NextResponse } from 'next/server';
import { getAll1Countries, getAll2Countries } from '@/lib/benotp';

export const dynamic = 'force-dynamic';

// Backs the country dropdown for all1/all2 - previously the frontend only
// had a free-text "type the numeric code" box, which meant a customer had
// to already know BenOTP's country IDs to buy a number at all.
export async function GET(req: Request) {
  const pool = new URL(req.url).searchParams.get('pool');

  if (pool !== 'all1' && pool !== 'all2') {
    return NextResponse.json({ success: false, error: 'pool must be all1 or all2' }, { status: 400 });
  }

  try {
    const countries = pool === 'all1' ? await getAll1Countries() : await getAll2Countries();
    return NextResponse.json({ success: true, pool, countries });
  } catch (e: any) {
    console.error(`BenOTP getCountries (${pool}) error:`, e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to load country list' },
      { status: 500 }
    );
  }
}
