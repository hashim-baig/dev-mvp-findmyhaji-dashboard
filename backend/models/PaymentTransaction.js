import mongoose from 'mongoose';
import crypto from 'crypto';

const paymentTransactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID()
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentId: {
    type: String,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  userEmail: {
    type: String,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  paymentStatus: {
    type: String,
    enum: ['initiated', 'pending', 'paid', 'failed', 'expired', 'canceled'],
    default: 'initiated'
  },
  status: {
    type: String,
    enum: ['open', 'complete', 'expired'],
    default: 'open'
  },
  packageId: {
    type: String,
    index: true
  },
  packageName: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stripeData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
paymentTransactionSchema.index({ sessionId: 1, paymentStatus: 1 });
paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ paymentStatus: 1, createdAt: -1 });

// Static method to create a new transaction
paymentTransactionSchema.statics.createTransaction = async function(data) {
  const transaction = new this({
    sessionId: data.sessionId,
    userId: data.userId,
    userEmail: data.userEmail,
    amount: data.amount,
    currency: data.currency,
    packageId: data.packageId,
    packageName: data.packageName,
    metadata: data.metadata || {},
    paymentStatus: 'initiated',
    status: 'open',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  });
  
  await transaction.save();
  return transaction;
};

// Static method to update transaction status
paymentTransactionSchema.statics.updateTransactionStatus = async function(sessionId, statusData) {
  const transaction = await this.findOne({ sessionId });
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  // Prevent duplicate processing
  if (transaction.paymentStatus === 'paid' && statusData.paymentStatus === 'paid') {
    return transaction;
  }
  
  // Update fields
  if (statusData.paymentStatus) transaction.paymentStatus = statusData.paymentStatus;
  if (statusData.status) transaction.status = statusData.status;
  if (statusData.paymentId) transaction.paymentId = statusData.paymentId;
  if (statusData.stripeData) transaction.stripeData = statusData.stripeData;
  if (statusData.paymentStatus === 'paid') transaction.completedAt = new Date();
  
  transaction.updatedAt = new Date();
  await transaction.save();
  return transaction;
};

// Static method to get user transactions
paymentTransactionSchema.statics.getUserTransactions = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Pre-save hook to update updatedAt
paymentTransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);