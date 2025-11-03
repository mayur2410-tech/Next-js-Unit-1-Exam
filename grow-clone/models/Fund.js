import mongoose from 'mongoose';

const fundSchema = new mongoose.Schema({
  schemeCode: {
    type: Number,
    required: true,
    unique: true,
  },
  schemeName: {
    type: String,
    required: true,
  },
  isinGrowth: {
    type: String,
    default: null,
  },
  isinDivReinvestment: {
    type: String,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for faster text search
fundSchema.index({ schemeName: 'text' });

export default mongoose.models.Fund || mongoose.model('Fund', fundSchema);