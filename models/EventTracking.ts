import mongoose, { Schema, Document } from "mongoose";

export interface IEventTracking extends Document {
  eventName: string;
  eventCategory: string;
  eventLabel?: string;
  eventValue?: number;
  path: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

const EventTrackingSchema: Schema = new Schema({
  eventName: { type: String, required: true },
  eventCategory: { type: String, required: true },
  eventLabel: { type: String },
  eventValue: { type: Number },
  path: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.EventTracking ||
  mongoose.model<IEventTracking>("EventTracking", EventTrackingSchema);
