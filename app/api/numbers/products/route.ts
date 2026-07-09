import { NextResponse } from 'next/server';
import { fiveSimRequest } from '@/lib/5sim';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ success: false, error: 'Country is required' }, { status: 400 });
  }

  try {
    // 5sim API v1 - get products for a specific country
    const data = await fiveSimRequest(`/products/${country}`);
    
    console.log('Products response for', country, ':', data);
    
    // 5sim returns an object where keys are product IDs
    if (data && typeof data === 'object') {
      const productList = Object.entries(data).map(([id, info]: [string, any]) => ({
        id,
        name: info.name || id
      }));
      
      return NextResponse.json({ 
        success: true, 
        products: productList.sort((a, b) => a.name.localeCompare(b.name))
      });
    }
    
    return NextResponse.json({ success: true, products: [] });
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      response: error.response?.data
    }, { status: 500 });
  }
}
