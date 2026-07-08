import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.YOUR_DANOTP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API key missing in Vercel Environment Variables', products: [] },
      { status: 500 }
    );
  }

  try {
    const url = `https://www.danotp.com.ng/stubs/buy-accounts.php?action=getProducts&api_key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`DanOTP Server Error: ${response.status}`);
    }

    const text = await response.text();
    let data;
    
    // Safely parse JSON
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    // Handle different DanOTP response structures
    let products = [];
    if (Array.isArray(data)) {
      products = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) products = data.data;
      else if (Array.isArray(data.products)) products = data.products;
      else if (data.data && typeof data.data === 'object') products = [data.data];
    }

    return NextResponse.json({
      success: true,
      products: products,
      debugRaw: typeof data === 'string' ? data.substring(0, 150) : null
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, products: [] },
      { status: 500 }
    );
  }
}
