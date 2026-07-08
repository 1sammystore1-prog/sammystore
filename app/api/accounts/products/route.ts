import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.YOUR_DANOTP_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      success: false, 
      error: 'API key not configured',
      products: [] 
    }, { status: 500 });
  }

  try {
    const url = `https://www.danotp.com.ng/stubs/buy-accounts.php?action=getProducts&api_key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    const text = await response.text();
    
    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `HTTP ${response.status}`,
        rawResponse: text.substring(0, 200)
      }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON response',
        rawResponse: text.substring(0, 300)
      }, { status: 500 });
    }

    // Extract products from categories structure
    let products = [];
    
    if (Array.isArray(data)) {
      products = data;
    } else if (data && typeof data === 'object') {
      // Check if products are in categories
      if (Array.isArray(data.categories)) {
        data.categories.forEach((category: any) => {
          if (Array.isArray(category.products)) {
            category.products.forEach((product: any) => {
              products.push({
                ...product,
                category: category.name
              });
            });
          }
        });
      }
      // Also check direct products array
      else if (Array.isArray(data.products)) {
        products = data.products;
      }
      // Check single product object
      else if (data.product && typeof data.product === 'object') {
        products = [data.product];
      }
    }

    return NextResponse.json({
      success: true,
      products: products,
      count: products.length,
      rawResponse: text.substring(0, 150)
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Network error',
      products: [] 
    }, { status: 500 });
  }
}
