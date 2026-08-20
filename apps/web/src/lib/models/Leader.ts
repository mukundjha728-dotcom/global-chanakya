import mongoose, { Schema, Document } from "mongoose";

export interface ILeader extends Document {
  name: string;
  slug: string;
  description?: string;
  countryId?: mongoose.Types.ObjectId;
  seo?: {
    title?: string;
    description?: string;
  };
  featuredImage?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const LeaderSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    countryId: { type: Schema.Types.ObjectId, ref: "Country", index: true },
    seo: {
      title: { type: String },
      description: { type: String },
    },
    featuredImage: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

export const Leader = mongoose.models.Leader || mongoose.model<ILeader>("Leader", LeaderSchema);
