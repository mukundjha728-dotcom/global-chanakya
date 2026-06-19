import mongoose, { Schema, Document } from "mongoose";

export interface ILeader extends Document {
  name: string;
  slug: string;
  countryId: mongoose.Types.ObjectId;
  title: string;
  party?: string;
  termStart: Date;
  imageUrl?: string;
  bio: string;
  foreignPolicyStance: string;
  approvalRating?: number;
  tags: string[];
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

const LeaderSchema = new Schema<ILeader>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
  title: { type: String, required: true },
  party: { type: String },
  termStart: { type: Date, required: true },
  imageUrl: { type: String },
  bio: { type: String, required: true },
  foreignPolicyStance: { type: String, required: true },
  approvalRating: { type: Number },
  tags: [{ type: String }],
  relations: [RelationSchema],
}, { timestamps: true });

export const Leader = mongoose.models.Leader || mongoose.model<ILeader>("Leader", LeaderSchema);
