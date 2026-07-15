import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  // Basic Information
  name: string;
  officialName?: string;
  slug: string;
  iso2Code?: string;
  iso3Code?: string;
  flagUrl?: string;
  capital?: string;
  population?: string;
  area?: number; // In square kilometers
  currency?: string;
  languages: string[];
  governmentType?: string;
  president?: string;
  primeMinister?: string;
  continent?: string;
  region?: string;
  subRegion?: string;
  independenceDate?: Date;
  timeZones: string[];
  nationalAnthem?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  overview: string; // Required by old schema
  description?: string;
  featuredImage?: string;
  gallery: string[];

  // Stats
  stats: {
    gdp?: string;
    militaryRank?: number;
    hdi?: number;
    literacyRate?: number;
    internetUsers?: number;
  };

  // Intelligence
  alliances: string[];
  intelligenceScore: number;
  geopoliticalStatus: string;

  // Publishing & SEO
  isPublished: boolean;
  status: "draft" | "published" | "scheduled" | "archived";
  publishAt?: Date;
  unpublishAt?: Date;
  featuredUntil?: Date;
  isSystemGenerated?: boolean;
  source?: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  // Relations (Future Expansion / Backward Compat)
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

  // Versioning & Deletion
  version: number;
  previousVersions?: any[];
  draftSnapshot?: any;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;

  // Flags
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  breakingUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RelationSchema = new Schema({
  targetId: { type: Schema.Types.ObjectId, required: true, refPath: "relations.targetModel" },
  targetModel: { type: String, required: true, enum: ["Country", "Leader", "Conflict", "Alliance", "Blog"] },
  type: { type: String, required: true },
  weight: { type: Number, default: 50 },
});

const CountrySchema = new Schema<ICountry>({
  name: { type: String, required: true },
  officialName: { type: String },
  slug: { type: String, required: true, unique: true, index: true },
  iso2Code: { type: String },
  iso3Code: { type: String },
  flagUrl: { type: String },
  capital: { type: String },
  population: { type: String },
  area: { type: Number },
  currency: { type: String },
  languages: [{ type: String }],
  governmentType: { type: String },
  president: { type: String },
  primeMinister: { type: String },
  continent: { type: String },
  region: { type: String },
  subRegion: { type: String },
  independenceDate: { type: Date },
  timeZones: [{ type: String }],
  nationalAnthem: { type: String },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  overview: { type: String, required: true },
  description: { type: String },
  featuredImage: { type: String },
  gallery: [{ type: String }],

  stats: {
    gdp: { type: String },
    militaryRank: { type: Number },
    hdi: { type: Number },
    literacyRate: { type: Number },
    internetUsers: { type: Number },
  },

  alliances: [{ type: String }],
  intelligenceScore: { type: Number, default: 50 },
  geopoliticalStatus: { type: String, default: "Neutral" },

  isPublished: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "published", "scheduled", "archived"], default: "draft" },
  publishAt: { type: Date },
  unpublishAt: { type: Date },
  featuredUntil: { type: Date },
  isSystemGenerated: { type: Boolean, default: false },
  source: { type: String, default: "manual" },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }],
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
  breakingUntil: { type: Date },
}, { timestamps: true });

export const Country = mongoose.models.Country || mongoose.model<ICountry>("Country", CountrySchema);
