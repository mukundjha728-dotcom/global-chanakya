import mongoose, { Schema, Document } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  organizationType?: "alliance" | "institution" | "bloc" | "corporate" | "non-state-actor" | "other";
  memberCountries?: mongoose.Types.ObjectId[];
  seo?: {
    title?: string;
    description?: string;
  };
  featuredImage?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    shortDescription: { type: String },
    organizationType: { 
      type: String, 
      enum: ["alliance", "institution", "bloc", "corporate", "non-state-actor", "other"],
      default: "other"
    },
    memberCountries: [{ type: Schema.Types.ObjectId, ref: "Country", index: true }],
    seo: {
      title: { type: String },
      description: { type: String },
    },
    featuredImage: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>("Organization", OrganizationSchema);
