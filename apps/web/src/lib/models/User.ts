import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatar?: string;
  role: "guest" | "free" | "premium" | "admin" | "super_admin" | "editor" | "analyst" | "researcher" | "writer";
  provider: "credentials" | "google" | "github";
  preferences: {
    notifications: {
      email: boolean;
      premiumExpiry: boolean;
      newArticles: boolean;
      commentReplies: boolean;
    };
    darkMode: boolean;
    language: string;
  };
  sessions: {
    token: string;
    device: string;
    ip: string;
    lastActive: Date;
    createdAt: Date;
  }[];
  isBanned: boolean;
  bannedReason?: string;
  emailVerified?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  authorSlug?: string;
  bio?: string;
  expertise?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  credentials?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["guest", "free", "premium", "admin", "super_admin", "editor", "analyst", "researcher", "writer"],
      default: "free",
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        premiumExpiry: { type: Boolean, default: true },
        newArticles: { type: Boolean, default: true },
        commentReplies: { type: Boolean, default: true },
      },
      darkMode: { type: Boolean, default: true },
      language: { type: String, default: "en" },
    },
    sessions: [
      {
        token: { type: String },
        device: { type: String },
        ip: { type: String },
        lastActive: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isBanned: { type: Boolean, default: false },
    bannedReason: { type: String },
    emailVerified: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    authorSlug: { type: String, unique: true, sparse: true },
    bio: { type: String },
    expertise: [{ type: String }],
    socialLinks: {
      twitter: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
    credentials: [{ type: String }],
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
