import { NextResponse } from 'next/server';
import { fiveSimRequest } from '@/lib/5sim';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ success: false, error: 'Country is required' }, { status: 400 });
  }

  try {
    // Use 'any' for operator to get all products
    const data = await fiveSimRequest(`/guest/products/${country}/any`);
    
    let products = [];

    // Handle both array and object responses from 5sim
    if (Array.isArray(data)) {
      products = data.map((p: any) => ({ id: p.name || p.id, name: p.name || p.id }));
    } else if (data && typeof data === 'object') {
      products = Object.entries(data).map(([id, info]: [string, any]) => ({
        id: id,
        name: info.name || id
      }));
    }

    return NextResponse.json({ success: true, products: products.sort((a: any, b: any) => a.name.localeCompare(b.name)) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
