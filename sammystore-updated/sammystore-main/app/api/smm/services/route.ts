import { NextResponse } from 'next/server';
import { japRequest } from '@/lib/jap';
import { getMarkups, computeMarkup } from '@/lib/pricing';

export async function GET() {
  try {
    const data = await japRequest('services');
    const markups = await getMarkups();

    // Mark up the rate shown to the customer so what they're quoted here
    // matches exactly what smm/order actually charges.
    const services = Array.isArray(data)
      ? data.map((s: any) => ({
          ...s,
          rate: computeMarkup(parseFloat(s.rate) || 0, markups.smm),
        }))
      : data;

    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
