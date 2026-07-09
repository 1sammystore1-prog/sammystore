import { NextResponse } from 'next/server';
import { fiveSimRequest } from '@/lib/5sim';

export async function GET() {
  try {
    // 5sim API v1 - get all countries
    const data = await fiveSimRequest('/countries');
    
    console.log('Countries response:', data);
    
    // 5sim returns an object where keys are country codes
    if (data && typeof data === 'object') {
      const countryList = Object.entries(data).map(([code, info]: [string, any]) => ({
        code,
        name: info.name || code.toUpperCase(),
        img: info.img || null
      }));
      
      return NextResponse.json({ 
        success: true, 
        countries: countryList.sort((a, b) => a.name.localeCompare(b.name))
      });
    }
    
    return NextResponse.json({ success: true, countries: [] });
  } catch (error: any) {
    console.error('Countries API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      response: error.response?.data
    }, { status: 500 });
  }
}
