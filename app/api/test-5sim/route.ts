import { NextResponse } from 'next/server';
import { fiveSimRequest } from '@/lib/5sim';

export async function GET() {
  const apiKey = process.env.FIVESIM_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'API key not set in Vercel',
      hint: 'Add FIVESIM_API_KEY to environment variables'
    }, { status: 500 });
  }

  try {
    // Try to get balance first (this often works even when countries fails)
    const balanceUrl = 'https://5sim.net/v1/user/profile';
    const balanceResponse = await fetch(balanceUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    let balanceInfo = null;
    if (balanceResponse.ok) {
      balanceInfo = await balanceResponse.json();
    }

    // Try countries endpoint
    const data = await fiveSimRequest('/countries/any');
    
    return NextResponse.json({ 
      success: true, 
      countriesCount: Object.keys(data).length,
      sampleCountries: Object.keys(data).slice(0, 10),
      balanceInfo: balanceInfo ? {
        balance: balanceInfo.balance,
        currency: balanceInfo.currency
      } : null
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      apiKeySet: true,
      hint: 'Make sure your 5sim account has balance and the API key is correct'
    }, { status: 500 });
  }
}
