import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  await dbConnect();
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ success: false, error: 'Please login' }, { status: 401 });

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalTransactions, activeNumbers, recentActivity, recentNumbers] = await Promise.all([
    Transaction.countDocuments({ userId }),
    Transaction.countDocuments({ userId, type: 'virtual_number', status: 'success' }),
    Transaction.find({ userId }).sort({ createdAt: -1 }).limit(8).lean(),
    Transaction.find({
      userId,
      type: 'virtual_number',
      status: 'success',
      activationId: { $exists: true, $ne: null },
      createdAt: { $gte: oneDayAgo },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return NextResponse.json({
    success: true,
    totalTransactions,
    activeNumbers,
    recentActivity,
    recentNumbers: recentNumbers.map((t: any) => ({
      activationId: t.activationId,
      description: t.description,
      createdAt: t.createdAt,
    })),
  });
}
