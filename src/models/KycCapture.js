const mongoose = require('mongoose');

const KycCaptureSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  photo: {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    accuracyMeters: Number,
  },
  consentGiven: { type: Boolean, required: true },
  consentTextVersion: String,
  ip: String,
  userAgent: String,
  capturedAt: { type: Date, default: Date.now },

  // Set by the separate auth/mapping module once it checks this capture
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verifiedAt: Date,
});

KycCaptureSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('KycCapture', KycCaptureSchema);