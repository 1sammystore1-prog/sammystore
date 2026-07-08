import { NextResponse } from 'next/server';
import { danotpRequest } from '@/lib/danotp';
import { getUserId } from '@/lib/auth';
import { deductBalance } from '@/lib/wallet';

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: 'Please login first' });

    const { service, country, quantity, areacode, pool } = await request.json();
    const cost = 500;

    const deduction = await deductBalance(userId, cost, `Rent ${service} number (${country})`);
    if (!deduction.success) {
      return NextResponse.json({ success: false, error: deduction.error });
    }

    const params: any = { service, country };
    if (quantity) params.quantity = quantity;
    if (areacode) params.areacode = areacode;
    if (pool) params.pool = pool;

    const data = await danotpRequest('getNumber', params);

    if (data.includes('ACCESS_NUMBER')) {
      const parts = data.split(':');
      return NextResponse.json({ 
        success: true, 
        orderId: parts[1], 
        phoneNumber: parts[2],
        newBalance: deduction.newBalance
      });
    } else {
      return NextResponse.json({ success: false, error: data });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
