import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'account_purchase', 'transfer', 'refund']
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Prevent overwriting the model if it already exists (common in Next.js hot reloading)
export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
