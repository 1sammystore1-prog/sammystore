import { NextResponse } from 'next/server';
import { checkSms } from '@/lib/tigerSms';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { getUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // This endpoint returns another party's SMS verification code, so it
    // must be authenticated and scoped to the caller. Previously this had
    // neither: anyone with any activation id (they look like small,
    // easily-guessable/sequential integers) could read any user's OTP
    // codes, which is a direct account-takeover vector for whatever
    // service that number was used to verify.
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const activationId = new URL(req.url).searchParams.get('id');
    
    if (!activationId) {
      return NextResponse.json(
        { success: false, error: 'Activation ID required' },
        { status: 400 }
      );
    }

    const owns = await Transaction.exists({ userId, activationId });
    if (!owns) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    const result = await checkSms(activationId);
    
    return NextResponse.json({
      success: true,
      status: result.status,
      sms: result.sms,
      statusCode: result.statusCode
    });
  } catch (e: any) {
    console.error('Check SMS error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to check SMS' },
      { status: 500 }
    );
  }
}
