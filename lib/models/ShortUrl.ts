import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShortUrl extends Document {
  slug: string;
  originalUrl: string;
  clicks: number;
  expiresAt: Date | null;
  createdAt: Date;
}

const ShortUrlSchema = new Schema<IShortUrl>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-z0-9-]+$/,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
      maxlength: 2048,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: { expireAfterSeconds: 0, sparse: true },
    },
  },
  {
    timestamps: true,
    collection: "short_urls",
  }
);

// Prevent model recompilation on hot reload
const ShortUrl: Model<IShortUrl> =
  mongoose.models.ShortUrl ??
  mongoose.model<IShortUrl>("ShortUrl", ShortUrlSchema);

export default ShortUrl;
