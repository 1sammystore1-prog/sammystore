import { NextResponse } from 'next/server';
import { fiveSimRequest } from '@/lib/5sim';

export async function GET() {
  try {
    const data = await fiveSimRequest('/guest/countries');
    
    // 5sim returns an object like: { "afghanistan": { iso: "af", text_en: "Afghanistan", ... }, ... }
    let countries = [];
    
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      countries = Object.entries(data).map(([key, info]: [string, any]) => ({
        code: info.iso || key,
        name: info.text_en || key.charAt(0).toUpperCase() + key.slice(1),
        prefix: info.prefix || ''
      }));
    } else if (Array.isArray(data)) {
      countries = data.map((c: any) => ({
        code: c.iso || c.name,
        name: c.text_en || c.name,
        prefix: c.prefix || ''
      }));
    }

    return NextResponse.json({ success: true, countries: countries.sort((a: any, b: any) => a.name.localeCompare(b.name)) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
