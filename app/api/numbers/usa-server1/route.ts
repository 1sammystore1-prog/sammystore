import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.YOUR_DANOTP_API_KEY;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'getServices';
  
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = `https://www.danotp.com.ng/stubs/handler_api.php?action=${action}&api_key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    const text = await response.text();
    
    if (!response.ok) {
      return NextResponse.json({ success: false, error: `HTTP ${response.status}` }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 500 });
    }

    // Convert object to array, removing duplicates by name
    let services = [];
    const seen = new Set();
    
    if (Array.isArray(data)) {
      services = data.filter(item => {
        const name = item.name || item;
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.services)) {
        services = data.services.filter(item => {
          const name = item.name || item;
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });
      } else {
        // Convert object entries to array
        services = Object.entries(data).map(([id, info]: [string, any]) => ({
          id,
          name: info.name || id,
          price: info.price || 0
        })).filter(item => {
          if (seen.has(item.name)) return false;
          seen.add(item.name);
          return true;
        });
      }
    }

    return NextResponse.json({ success: true, services, count: services.length });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.YOUR_DANOTP_API_KEY;
  const body = await request.json();
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      action: 'getNumber',
      api_key: apiKey,
      service: body.service || '',
      country: 'usa',
      ...(body.carrier && { carrier: body.carrier }),
      ...(body.area_codes && { area_codes: body.area_codes }),
      ...(body.duration && { duration: body.duration })
    });

    const response = await fetch(`https://www.danotp.com.ng/stubs/handler_api.php?${params.toString()}`);
    const text = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      rawResponse: text,
      parsed: (() => { try { return JSON.parse(text); } catch { return text; } })()
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
