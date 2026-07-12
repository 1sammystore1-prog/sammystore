import { NextResponse } from 'next/server';
import { clubkonnectRequest } from '@/lib/clubkonnect';
import { getMarkups, computeMarkup } from '@/lib/pricing';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'data';
  const network = searchParams.get('network');

  try {
    const params: any = { type };
    if (network) params.network = network;

    const data = await clubkonnectRequest('/plans', params);
    const markups = await getMarkups();

    const plans = Array.isArray(data)
      ? data.map((p: any) => ({
          ...p,
          price: computeMarkup(parseFloat(p.price) || 0, markups.vtu),
        }))
      : data;

    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
