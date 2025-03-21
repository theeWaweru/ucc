import mongoose, { Schema, Document } from "mongoose";

export interface IPageView extends Document {
  path: string;
  ip: string;
  userAgent: string;
  referrer: string;
  timestamp: Date;
}

const PageViewSchema: Schema = new Schema({
  path: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  referrer: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.PageView ||
  mongoose.model<IPageView>("PageView", PageViewSchema);
