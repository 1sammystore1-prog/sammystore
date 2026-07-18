import mongoose, { Schema, Document, Model } from 'mongoose';

// Single settings document holding the admin-controlled markup percentage
// applied on top of each provider's raw cost, per product category. This is
// what turns provider cost into what the customer actually pays - without
// it every product was being resold at exactly cost, with zero margin.
export interface IPricingSettings extends Document {
  key: string;
  markups: {
    numbers: number;
    smm: number;
    accounts: number;
  };
  benotpPrices: {
    usa1: number;
    usa2: number;
    all1: number;
    all2: number;
  };
}

const PricingSettingsSchema: Schema<IPricingSettings> = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'pricing' },
    markups: {
      numbers: { type: Number, default: 20 },
      smm: { type: Number, default: 20 },
      accounts: { type: Number, default: 20 },
    },
    // Flat admin-set NGN price per BenOTP pool, charged per number ONLY as
    // a fallback when a live per-service price lookup fails - all 4 pools
    // now have a working live pricing path (see lib/benotp.ts), so this is
    // a safety net, not the normal price.
    benotpPrices: {
      usa1: { type: Number, default: 500 },
      usa2: { type: Number, default: 500 },
      all1: { type: Number, default: 300 },
      all2: { type: Number, default: 300 },
    },
  },
  { timestamps: true }
);

export default (mongoose.models.PricingSettings as Model<IPricingSettings>) ||
  mongoose.model<IPricingSettings>('PricingSettings', PricingSettingsSchema);
