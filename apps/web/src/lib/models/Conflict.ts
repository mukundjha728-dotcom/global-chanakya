import mongoose, { Schema, Document } from "mongoose";

export interface IConflict extends Document {
  title: string;
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived" | "Active" | "Escalating" | "Frozen" | "Resolved";
  publishAt?: Date;
  unpublishAt?: Date;
  featuredUntil?: Date;
  source?: string;
  isSystemGenerated?: boolean;
  overview: string;
  regions: string[];
  tags?: string[];
  startDate: Date;
  endDate?: Date;
  involvedParties?: {
    countryId: mongoose.Types.ObjectId;
    role: string;
  }[];
  economicImpact?: string;
  casualties?: string;
  seo?: {
    title: string;
    description: string;
  };
  relations?: {
    targetId: mongoose.Types.ObjectId;
    targetModel: "Country" | "Leader" | "Conflict" | "Alliance" | "Blog";
    type: string;
    weight: number;
  }[];
  timelineReferences?: mongoose.Types.ObjectId[];
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

const InvolvedPartySchema = new Schema({
  countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
  role: { type: String, required: true },
});

const ConflictSchema = new Schema<IConflict>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, enum: ["draft", "published", "scheduled", "archived", "Active", "Escalating", "Frozen", "Resolved"], default: "draft" },
  publishAt: { type: Date },
  unpublishAt: { type: Date },
  featuredUntil: { type: Date },
  source: { type: String, default: "manual" },
  isSystemGenerated: { type: Boolean, default: false },
  overview: { type: String, required: true },
  regions: [{ type: String }],
  tags: [{ type: String }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  involvedParties: [InvolvedPartySchema],
  economicImpact: { type: String },
  casualties: { type: String },
  seo: {
    title: { type: String },
    description: { type: String },
  },
  relations: [RelationSchema],
  timelineReferences: [{ type: Schema.Types.ObjectId, ref: "Timeline" }],
  version: { type: Number, default: 1 },
  previousVersions: [{ type: Schema.Types.Mixed }],
  draftSnapshot: { type: Schema.Types.Mixed },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  isBreaking: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  breakingUntil: { type: Date },
}, { timestamps: true });

export const Conflict = mongoose.models.Conflict || mongoose.model<IConflict>("Conflict", ConflictSchema);
