import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  name: string;
  slug: string;
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
}, { timestamps: true });

export const Country = mongoose.models.Country || mongoose.model<ICountry>("Country", CountrySchema);
