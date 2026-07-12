import { NextResponse } from 'next/server';
import { getPrices } from '@/lib/tigerSms';
import { toNgn, getMarkups, computeMarkup } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const country = new URL(req.url).searchParams.get('country');
    if (!country) {
      return NextResponse.json(
        { success: false, error: 'Country parameter required' },
        { status: 400 }
      );
    }

    const services = await getPrices(country);
    const markups = await getMarkups();
    const withNgnPrice = services.map((s) => ({
      ...s,
      priceNgn: computeMarkup(toNgn(s.price), markups.numbers),
    }));
    return NextResponse.json({ success: true, services: withNgnPrice });
  } catch (e: any) {
    console.error('Get services error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to load services' },
      { status: 500 }
    );
  }
}
