import mongoose, { Schema, Document } from "mongoose";

export interface IConflict extends Document {
  title: string;
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived";
  publishAt?: Date;
  unpublishAt?: Date;
  breakingUntil?: Date;
  featuredUntil?: Date;
  source?: string;
  isSystemGenerated?: boolean;
  conflictState: "Active" | "Ceasefire" | "Resolved" | "Escalating"; // Renamed from status
  startDate: Date;
  endDate?: Date;
  regions: string[]; // e.g., ["Eastern Europe", "Middle East"]
  involvedParties: {
    countryId: mongoose.Types.ObjectId;
    role: "Aggressor" | "Defender" | "Proxy" | "Mediator";
  }[];
  overview: string;
  casualties?: string;
  economicImpact: string;
  tags: string[];
  relations?: {
    targetId: mongoose.Types.ObjectId;
    targetModel: "Country" | "Leader" | "Conflict" | "Alliance" | "Blog";
    type: string;
    weight: number;
  }[];
  involvedCountries?: mongoose.Types.ObjectId[];
  relatedLeaders?: mongoose.Types.ObjectId[];
  timelineReferences?: mongoose.Types.ObjectId[];
  strategicTags?: string[];
  version: number;
  previousVersions?: any[];
  draftSnapshot?: any;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
}

const RelationSchema = new Schema({
  targetId: { type: Schema.Types.ObjectId, required: true, refPath: "relations.targetModel" },
  targetModel: { type: String, required: true, enum: ["Country", "Leader", "Conflict", "Alliance", "Blog"] },
  type: { type: String, required: true },
  weight: { type: Number, default: 50 },
});

const ConflictSchema = new Schema<IConflict>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, enum: ["draft", "published", "scheduled", "archived"], default: "draft" },
  publishAt: { type: Date },
  unpublishAt: { type: Date },
  breakingUntil: { type: Date },
  featuredUntil: { type: Date },
  source: { type: String, default: "manual" },
  isSystemGenerated: { type: Boolean, default: false },
  conflictState: { type: String, required: true, enum: ["Active", "Ceasefire", "Resolved", "Escalating"] },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  regions: [{ type: String }],
  involvedParties: [{
    countryId: { type: Schema.Types.ObjectId, ref: "Country" },
    role: { type: String },
  }],
  overview: { type: String, required: true },
  casualties: { type: String },
  economicImpact: { type: String },
  tags: [{ type: String }],
  relations: [RelationSchema],
  involvedCountries: [{ type: Schema.Types.ObjectId, ref: "Country" }],
  relatedLeaders: [{ type: Schema.Types.ObjectId, ref: "Leader" }],
  timelineReferences: [{ type: Schema.Types.ObjectId, ref: "Timeline" }],
  strategicTags: [{ type: String }],

    version: { type: Number, default: 1 },
    previousVersions: [{ type: Schema.Types.Mixed }],
    draftSnapshot: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },}, { timestamps: true });

export const Conflict = mongoose.models.Conflict || mongoose.model<IConflict>("Conflict", ConflictSchema);
