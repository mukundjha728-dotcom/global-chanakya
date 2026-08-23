import mongoose, { Schema, Document } from "mongoose";

export interface IConflict extends Document {
  name: string;
  slug: string;
  description?: string;
  countryIds?: mongoose.Types.ObjectId[];
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

const ConflictSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    countryIds: [{ type: Schema.Types.ObjectId, ref: "Country", index: true }],
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

export const Conflict = mongoose.models.Conflict || mongoose.model<IConflict>("Conflict", ConflictSchema);
