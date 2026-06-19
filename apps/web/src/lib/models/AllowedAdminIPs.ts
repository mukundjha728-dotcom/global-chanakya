import mongoose, { Schema, Document } from "mongoose";

export interface IAllowedAdminIP extends Document {
  ip: string;
  isActive: boolean;
  createdAt: Date;
}

const AllowedAdminIPsSchema = new Schema<IAllowedAdminIP>({
  ip: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const AllowedAdminIPs = mongoose.models.AllowedAdminIPs || mongoose.model<IAllowedAdminIP>("AllowedAdminIPs", AllowedAdminIPsSchema);
