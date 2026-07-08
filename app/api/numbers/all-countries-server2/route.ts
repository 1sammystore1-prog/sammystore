import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.YOUR_DANOTP_API_KEY;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'getServices';
  const country = searchParams.get('country') || 'US';
  
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = action === 'getServices' 
      ? `https://www.danotp.com.ng/stubs/all_server_2.php?action=${action}&api_key=${apiKey}&country=${country}`
      : `https://www.danotp.com.ng/stubs/all_server_2.php?action=${action}&api_key=${apiKey}`;
    
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

    // Server 2 returns object with IDs as keys - convert to array and remove duplicates
    let result = [];
    const seen = new Set();
    
    if (Array.isArray(data)) {
      result = data.filter(item => {
        const name = item.name || item.code || item;
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.services)) {
        result = data.services.filter(item => {
          const name = item.name || item;
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });
      } else if (Array.isArray(data.countries)) {
        result = data.countries.filter(item => {
          const name = item.name || item.code || item;
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });
      } else {
        // Convert object entries to array - THIS IS THE KEY FIX
        result = Object.entries(data).map(([id, info]: [string, any]) => ({
          id: id,
          name: info.name || id,
          price: parseFloat(info.price || 0),
          formattedPrice: `₦${parseFloat(info.price || 0).toLocaleString()}`,
          ...info
        })).filter(item => {
          // Remove duplicates by name
          if (seen.has(item.name)) return false;
          seen.add(item.name);
          return true;
        });
      }
    }

    return NextResponse.json({ success: true, data: result, count: result.length });

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
      country: body.country || '',
      ...(body.maxPrice && { maxPrice: body.maxPrice }),
      ...(body.operator && { operator: body.operator }),
      ...(body.ref && { ref: body.ref })
    });

    const response = await fetch(`https://www.danotp.com.ng/stubs/all_server_2.php?${params.toString()}`);
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
