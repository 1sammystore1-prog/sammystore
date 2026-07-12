import dbConnect from './mongodb';
import RateLimit from '@/models/RateLimit';

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

// Sliding-window limiter backed by Mongo so it works correctly across
// serverless function instances (an in-memory counter would reset on every
// cold start and wouldn't be shared between instances). The update is a
// single atomic aggregation-pipeline write, so concurrent requests for the
// same key can't race past each other and both slip through.
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  await dbConnect();

  const now = new Date();
  const cutoff = new Date(now.getTime() - windowMs);

  const doc = await RateLimit.findOneAndUpdate(
    { key },
    [
      {
        $set: {
          windowStart: {
            $cond: [{ $gt: ['$windowStart', cutoff] }, '$windowStart', now],
          },
          count: {
            $cond: [
              { $gt: ['$windowStart', cutoff] },
              { $add: [{ $ifNull: ['$count', 0] }, 1] },
              1,
            ],
          },
        },
      },
    ],
    { upsert: true, new: true }
  );

  if (doc.count > maxAttempts) {
    const elapsed = now.getTime() - doc.windowStart.getTime();
    const retryAfterSeconds = Math.max(Math.ceil((windowMs - elapsed) / 1000), 1);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}
