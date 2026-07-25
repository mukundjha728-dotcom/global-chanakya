import mongoose, { Schema, Document } from "mongoose";

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  entityType: "topic";
  entityId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  entityType: {
    type: String,
    enum: ["topic"],
    required: true,
  },
  entityId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Optimized indexing: compound unique index to prevent duplicate follows
WatchlistSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

// Index for getting a user's entire watchlist quickly
WatchlistSchema.index({ userId: 1, createdAt: -1 });

export const Watchlist = mongoose.models.Watchlist || mongoose.model<IWatchlist>("Watchlist", WatchlistSchema);
