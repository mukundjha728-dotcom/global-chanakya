import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  name: string;
  slug: string;
  description?: string;
  regionId?: mongoose.Types.ObjectId;
  seo?: {
    title?: string;
    description?: string;
  };
  featuredImage?: string;
  aliases?: string[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    regionId: { type: Schema.Types.ObjectId, ref: "Region", index: true },
    seo: {
      title: { type: String },
      description: { type: String },
    },
    featuredImage: { type: String },
    aliases: [{ type: String }],
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

export const Country = mongoose.models.Country || mongoose.model<ICountry>("Country", CountrySchema);
