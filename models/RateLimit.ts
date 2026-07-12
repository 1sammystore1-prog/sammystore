import mongoose, { Schema, Document, Model } from 'mongoose';

// Backs a simple sliding-window rate limiter (see lib/rateLimit.ts). One
// document per limited key (e.g. "login:ip:1.2.3.4" or "login:email:x@y.com").
export interface IRateLimit extends Document {
  key: string;
  count: number;
  windowStart: Date;
}

const RateLimitSchema: Schema<IRateLimit> = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  windowStart: { type: Date, required: true, default: Date.now },
});

// Auto-cleanup: documents are only ever relevant within their window, so
// there's no need to keep them around - expire 1 day after windowStart.
RateLimitSchema.index({ windowStart: 1 }, { expireAfterSeconds: 86400 });

export default (mongoose.models.RateLimit as Model<IRateLimit>) || mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);
