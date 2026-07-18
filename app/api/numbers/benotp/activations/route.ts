import { NextResponse } from 'next/server';
import { getAll2ActiveActivations } from '@/lib/benotp';

export const dynamic = 'force-dynamic';

// all2-only: bundles the open-activations list with account balance/
// currency in one call, unlike the generic getBalance used elsewhere.
export async function GET() {
  try {
    const result = await getAll2ActiveActivations();
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    console.error('BenOTP getActiveActivations (all2) error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to load active activations' },
      { status: 500 }
    );
  }
}
