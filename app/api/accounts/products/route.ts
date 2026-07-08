import { NextResponse } from 'next/server';
import { buyAccountsRequest } from '@/lib/buyaccounts';

export async function GET() {
  try {
    const data = await buyAccountsRequest('getProducts');
    return NextResponse.json({ success: true, products: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
