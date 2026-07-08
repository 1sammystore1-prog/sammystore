import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.YOUR_DANOTP_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'API key not configured',
        products: [] 
      }, { status: 500 });
    }

    // Call DanOTP Buy Accounts API
    const response = await fetch(
      `https://www.danotp.com.ng/stubs/buy-accounts.php?action=getProducts&api_key=${apiKey}`,
      { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );

    const rawText = await response.text();
    
    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `HTTP ${response.status}`,
        products: [],
        debugRaw: rawText.substring(0, 200)
      }, { status: response.status });
    }

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON response',
        products: [],
        debugRaw: rawText.substring(0, 300)
      }, { status: 500 });
    }

    // Extract products from response
    let products = [];
    if (Array.isArray(data)) {
      products = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) products = data.data;
      else if (Array.isArray(data.products)) products = data.products;
      else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        products = [data.data];
      }
    }

    return NextResponse.json({
      success: true,
      products: products,
      debugRaw: rawText.substring(0, 150)
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      products: [],
      debugRaw: 'Connection failed'
    }, { status: 500 });
  }
}
