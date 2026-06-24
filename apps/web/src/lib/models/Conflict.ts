import mongoose, { Schema, Document } from "mongoose";

export interface IConflict extends Document {
  title: string;
  slug: string;
  status: "Active" | "Ceasefire" | "Resolved" | "Escalating";
  startDate: Date;
  endDate?: Date;
  regions: string[]; // e.g., ["Eastern Europe", "Middle East"]
  involvedParties: {
    countryId: mongoose.Types.ObjectId;
    role: "Aggressor" | "Defender" | "Proxy" | "Mediator";
  }[];
  overview: string;
  casualties?: string;
  economicImpact: string;
  tags: string[];
  relations?: {
    targetId: mongoose.Types.ObjectId;
    targetModel: "Country" | "Leader" | "Conflict" | "Alliance" | "Blog";
    type: string;
    weight: number;
  }[];
  involvedCountries?: mongoose.Types.ObjectId[];
  relatedLeaders?: mongoose.Types.ObjectId[];
  timelineReferences?: mongoose.Types.ObjectId[];
  strategicTags?: string[];
}

const RelationSchema = new Schema({
  targetId: { type: Schema.Types.ObjectId, required: true, refPath: "relations.targetModel" },
  targetModel: { type: String, required: true, enum: ["Country", "Leader", "Conflict", "Alliance", "Blog"] },
  type: { type: String, required: true },
  weight: { type: Number, default: 50 },
});

const ConflictSchema = new Schema<IConflict>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  regions: [{ type: String }],
  involvedParties: [{
    countryId: { type: Schema.Types.ObjectId, ref: "Country" },
    role: { type: String },
  }],
  overview: { type: String, required: true },
  casualties: { type: String },
  economicImpact: { type: String },
  tags: [{ type: String }],
  relations: [RelationSchema],
  involvedCountries: [{ type: Schema.Types.ObjectId, ref: "Country" }],
  relatedLeaders: [{ type: Schema.Types.ObjectId, ref: "Leader" }],
  timelineReferences: [{ type: Schema.Types.ObjectId, ref: "Timeline" }],
  strategicTags: [{ type: String }],
}, { timestamps: true });

export const Conflict = mongoose.models.Conflict || mongoose.model<IConflict>("Conflict", ConflictSchema);
