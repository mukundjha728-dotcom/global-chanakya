import mongoose, { Schema, Document } from "mongoose";

export interface ICountryCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CountryCategorySchema = new Schema<ICountryCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    icon: { type: String },
  },
  { timestamps: true }
);

CountryCategorySchema.pre("validate", function () {
  if (this.slug) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  } else if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }
});

export const CountryCategory = mongoose.models.CountryCategory || mongoose.model<ICountryCategory>("CountryCategory", CountryCategorySchema);
