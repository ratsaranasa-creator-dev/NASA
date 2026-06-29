const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index pour l'expiration automatique des OTP
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index pour une recherche rapide par email et code
otpSchema.index({ email: 1, code: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
