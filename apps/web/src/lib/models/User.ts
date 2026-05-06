import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  role: "guest" | "free" | "premium" | "admin";
  provider: "credentials" | "google" | "github";
  subscription?: {
    plan: string;
    expiresAt: Date;
    status: "active" | "expired";
  };
  bookmarks: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ["guest", "free", "premium", "admin"], default: "free" },
  provider: { type: String, enum: ["credentials", "google", "github"], default: "credentials" },
  subscription: {
    plan: { type: String },
    expiresAt: { type: Date },
    status: { type: String, enum: ["active", "expired"] }
  },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
