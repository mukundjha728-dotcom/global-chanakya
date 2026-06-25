import mongoose, { Schema, Document } from "mongoose";

export interface ILeader extends Document {
  name: string;
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived";
  publishAt?: Date;
  unpublishAt?: Date;
  featuredUntil?: Date;
  source?: string;
  isSystemGenerated?: boolean;
  countryId: mongoose.Types.ObjectId;
  title: string;
  party?: string;
  termStart: Date;
  imageUrl?: string;
  bio: string;
  foreignPolicyStance: string;
  approvalRating?: number;
  tags: string[];
  relations?: {
    targetId: mongoose.Types.ObjectId;
    targetModel: "Country" | "Leader" | "Conflict" | "Alliance" | "Blog";
    type: string;
    weight: number;
  }[];
  version: number;
  previousVersions?: any[];
  draftSnapshot?: any;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  breakingUntil?: Date;
}

const RelationSchema = new Schema({
  targetId: { type: Schema.Types.ObjectId, required: true, refPath: "relations.targetModel" },
  targetModel: { type: String, required: true, enum: ["Country", "Leader", "Conflict", "Alliance", "Blog"] },
  type: { type: String, required: true },
  weight: { type: Number, default: 50 },
});

const LeaderSchema = new Schema<ILeader>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, enum: ["draft", "published", "scheduled", "archived"], default: "draft" },
  publishAt: { type: Date },
  unpublishAt: { type: Date },
  featuredUntil: { type: Date },
  source: { type: String, default: "manual" },
  isSystemGenerated: { type: Boolean, default: false },
  countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
  title: { type: String, required: true },
  party: { type: String },
  termStart: { type: Date, required: true },
  imageUrl: { type: String },
  bio: { type: String, required: true },
  foreignPolicyStance: { type: String, required: true },
  approvalRating: { type: Number },
  tags: [{ type: String }],
  relations: [RelationSchema],

    version: { type: Number, default: 1 },
    previousVersions: [{ type: Schema.Types.Mixed }],
    draftSnapshot: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    breakingUntil: { type: Date },}, { timestamps: true });

export const Leader = mongoose.models.Leader || mongoose.model<ILeader>("Leader", LeaderSchema);
