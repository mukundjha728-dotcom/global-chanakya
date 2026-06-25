import mongoose, { Schema, Document } from "mongoose";

export interface IRegion extends Document {
  title: string;
  slug: string;
  theatre: string;
  strategicWeight: "Critical" | "High" | "Medium" | "Low";
  status: "draft" | "published" | "scheduled" | "archived";
  publishAt?: Date;
  unpublishAt?: Date;
  featuredUntil?: Date;
  breakingUntil?: Date;
  source?: string;
  isSystemGenerated?: boolean;
  version: number;
  previousVersions?: any[];
  draftSnapshot?: any;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  isBreaking: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  summary: string;
  category: string;
  keyPlayers: string[]; // Keep as strings or objectIds based on preference
  image?: string;
  trend: "Up" | "Down" | "Stable";
  createdAt: Date;
  updatedAt: Date;
}

const RegionSchema = new Schema<IRegion>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  theatre: { type: String, required: true },
  strategicWeight: { type: String, enum: ["Critical", "High", "Medium", "Low"], required: true },
  status: { type: String, enum: ["draft", "published", "scheduled", "archived"], default: "draft" },
  publishAt: { type: Date },
  unpublishAt: { type: Date },
  featuredUntil: { type: Date },
  breakingUntil: { type: Date },
  source: { type: String, default: "manual" },
  isSystemGenerated: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  previousVersions: [{ type: Schema.Types.Mixed }],
  draftSnapshot: { type: Schema.Types.Mixed },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  isBreaking: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  summary: { type: String, required: true },
  category: { type: String, required: true },
  keyPlayers: [{ type: String }],
  image: { type: String },
  trend: { type: String, enum: ["Up", "Down", "Stable"], required: true },
}, { timestamps: true });

export const Region = mongoose.models.Region || mongoose.model<IRegion>("Region", RegionSchema);
