import mongoose, { Schema, Document } from "mongoose";

export interface ICountryTag extends Document {
  name: string;
  slug: string;
  country?: mongoose.Types.ObjectId; // Optional: If empty, it's a global tag across all countries
  createdAt: Date;
  updatedAt: Date;
}

const CountryTagSchema = new Schema<ICountryTag>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    country: { type: Schema.Types.ObjectId, ref: "Country" },
  },
  { timestamps: true }
);

// Ensure uniqueness of tag slug per country, or globally if no country
CountryTagSchema.index({ slug: 1, country: 1 }, { unique: true });

CountryTagSchema.pre("validate", function () {
  if (this.slug) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  } else if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }
});

export const CountryTag = mongoose.models.CountryTag || mongoose.model<ICountryTag>("CountryTag", CountryTagSchema);
