import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.YOUR_DANOTP_API_KEY;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const params: any = { action, api_key: apiKey };
    
    searchParams.forEach((value, key) => {
      if (key !== 'action') params[key] = value;
    });

    const response = await fetch('https://www.danotp.com.ng/stubs/all_server_2.php', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      body: new URLSearchParams(params).toString()
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.YOUR_DANOTP_API_KEY;
  const body = await request.json();
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const params = {
      action: 'getNumber',
      api_key: apiKey,
      ...body
    };

    const response = await fetch('https://www.danotp.com.ng/stubs/all_server_2.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json' 
      },
      body: new URLSearchParams(params).toString()
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
