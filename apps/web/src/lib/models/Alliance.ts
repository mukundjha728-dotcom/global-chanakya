import mongoose, { Schema, Document } from "mongoose";

export interface IRelation {
  targetId: mongoose.Types.ObjectId;
  targetModel: "Country" | "Leader" | "Conflict" | "Alliance" | "Blog";
  type: string; // e.g. "member", "founder", "opponent"
  weight: number; // 1-100 for scoring
}

export interface IAlliance extends Document {
  name: string;
  slug: string;
  acronym?: string;
  description: string;
  founded: Date;
  headquarters?: string;
  memberCountries: mongoose.Types.ObjectId[];
  relations: IRelation[];
}

const RelationSchema = new Schema<IRelation>({
  targetId: { type: Schema.Types.ObjectId, required: true, refPath: "relations.targetModel" },
  targetModel: { type: String, required: true, enum: ["Country", "Leader", "Conflict", "Alliance", "Blog"] },
  type: { type: String, required: true },
  weight: { type: Number, default: 50 },
});

const AllianceSchema = new Schema<IAlliance>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  acronym: { type: String },
  description: { type: String, required: true },
  founded: { type: Date, required: true },
  headquarters: { type: String },
  memberCountries: [{ type: Schema.Types.ObjectId, ref: "Country" }],
  relations: [RelationSchema],
}, { timestamps: true });

export const Alliance = mongoose.models.Alliance || mongoose.model<IAlliance>("Alliance", AllianceSchema);
