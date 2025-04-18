// Database/models/otp.model.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  },
});

// TTL index - automatically deletes expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const otpModel = mongoose.model("Otp", otpSchema);
