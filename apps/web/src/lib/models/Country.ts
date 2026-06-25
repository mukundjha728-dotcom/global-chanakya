import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  name: string;
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived";
  publishAt?: Date;
  unpublishAt?: Date;
  featuredUntil?: Date;
  source?: string;
  isSystemGenerated?: boolean;
  isoCode: string;
  flagUrl?: string;
  region: string;
  overview: string;
  capital: string;
  population: number;
  gdp?: string;
  alliances: string[]; // e.g., NATO, BRICS
  intelligenceScore: number;
  geopoliticalStatus: "Superpower" | "Regional Power" | "Emerging" | "Neutral" | "Conflict Zone";
  seo: {
    title: string;
    description: string;
  };
  relations?: {
    targetId: mongoose.Types.ObjectId;
    targetModel: "Country" | "Leader" | "Conflict" | "Alliance" | "Blog";
    type: string;
    weight: number;
  }[];
  relatedConflicts?: mongoose.Types.ObjectId[];
  relatedLeaders?: mongoose.Types.ObjectId[];
  relatedAlliances?: mongoose.Types.ObjectId[];
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

const CountrySchema = new Schema<ICountry>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, enum: ["draft", "published", "scheduled", "archived"], default: "draft" },
  publishAt: { type: Date },
  unpublishAt: { type: Date },
  featuredUntil: { type: Date },
  source: { type: String, default: "manual" },
  isSystemGenerated: { type: Boolean, default: false },
  isoCode: { type: String, required: true },
  flagUrl: { type: String },
  region: { type: String, required: true },
  overview: { type: String, required: true },
  capital: { type: String, required: true },
  population: { type: Number, required: true },
  gdp: { type: String },
  alliances: [{ type: String }],
  intelligenceScore: { type: Number, default: 50 },
  geopoliticalStatus: { type: String, required: true },
  seo: {
    title: { type: String },
    description: { type: String },
  },
  relations: [RelationSchema],
  relatedConflicts: [{ type: Schema.Types.ObjectId, ref: "Conflict" }],
  relatedLeaders: [{ type: Schema.Types.ObjectId, ref: "Leader" }],
  relatedAlliances: [{ type: Schema.Types.ObjectId, ref: "Alliance" }],
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
    breakingUntil: { type: Date },}, { timestamps: true });

export const Country = mongoose.models.Country || mongoose.model<ICountry>("Country", CountrySchema);
