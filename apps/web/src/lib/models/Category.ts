import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  seo?: {
    title?: string;
    description?: string;
  };
  featuredImage?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    seo: {
      title: { type: String },
      description: { type: String },
    },
    featuredImage: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
