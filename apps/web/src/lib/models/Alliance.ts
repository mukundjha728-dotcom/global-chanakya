import mongoose, { Schema, Document } from "mongoose";

export interface IRelation {
  targetId: mongoose.Types.ObjectId;
  targetModel: "Country" | "Leader" | "Conflict" | "Alliance" | "Blog";
  type: string; // e.g. "member", "founder", "opponent"
  weight: number; // 1-100 for scoring
}

export interface IAlliance extends Document {
  name: string;
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived";
  publishAt?: Date;
  unpublishAt?: Date;
  featuredUntil?: Date;
  source?: string;
  isSystemGenerated?: boolean;
  acronym?: string;
  description: string;
  founded: Date;
  headquarters?: string;
  memberCountries: mongoose.Types.ObjectId[];
  relations: IRelation[];
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

const RelationSchema = new Schema<IRelation>({
  targetId: { type: Schema.Types.ObjectId, required: true, refPath: "relations.targetModel" },
  targetModel: { type: String, required: true, enum: ["Country", "Leader", "Conflict", "Alliance", "Blog"] },
  type: { type: String, required: true },
  weight: { type: Number, default: 50 },

});

const AllianceSchema = new Schema<IAlliance>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, enum: ["draft", "published", "scheduled", "archived"], default: "draft" },
  publishAt: { type: Date },
  unpublishAt: { type: Date },
  featuredUntil: { type: Date },
  source: { type: String, default: "manual" },
  isSystemGenerated: { type: Boolean, default: false },
  acronym: { type: String },
  description: { type: String, required: true },
  founded: { type: Date, required: true },
  headquarters: { type: String },
  memberCountries: [{ type: Schema.Types.ObjectId, ref: "Country" }],
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
  breakingUntil: { type: Date },
}, { timestamps: true });

export const Alliance = mongoose.models.Alliance || mongoose.model<IAlliance>("Alliance", AllianceSchema);
