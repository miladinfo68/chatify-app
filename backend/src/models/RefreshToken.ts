// src/models/RefreshToken.ts
import { Document, model, Schema, Types } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  userId: Types.ObjectId;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userAgent: { type: String },
  ipAddress: { type: String },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date },
}, {
  timestamps: true,
});

// 🔐 OPTIMIZED INDEXES for better query performance
//expireAfterSeconds: 0 means 
// MongoDB will delete the document when expiresAt <= current time
// The 0 means "delete exactly at the expiration time"
// This runs as a background process every 60 seconds

// refreshTokenSchema.index({ token: 1 }); // Fast token lookup (already had this)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens
refreshTokenSchema.index({ userId: 1, revokedAt: 1 }); // Fast queries for user's active tokens
refreshTokenSchema.index({ createdAt: -1 }); // For cleanup and analytics

export const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);