import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * One document per calendar day (UTC), shared across all AI tools combined.
 * A single atomic $inc keeps this accurate across concurrent serverless
 * instances, which an in-memory counter (like lib/rateLimit.ts) cannot do —
 * this is the durable, cross-instance backstop against a distributed abuse
 * pattern that stays under any single IP's rate limit.
 */
export interface IAiUsage extends Document {
  date: string; // "YYYY-MM-DD" (UTC)
  count: number;
}

const AiUsageSchema = new Schema<IAiUsage>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    collection: "ai_usage",
  }
);

const AiUsage: Model<IAiUsage> =
  mongoose.models.AiUsage ?? mongoose.model<IAiUsage>("AiUsage", AiUsageSchema);

export default AiUsage;
