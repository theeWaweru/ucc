// Update models/Event.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  imageUrl?: string;
  registrationRequired: boolean;
  registrationUrl?: string;
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    monthOfYear?: number;
    endDate?: Date;
    count?: number;
  };
}

const RecurrencePatternSchema: Schema = new Schema(
  {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    interval: { type: Number, default: 1 },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0 = Sunday, 6 = Saturday
    dayOfMonth: { type: Number, min: 1, max: 31 },
    monthOfYear: { type: Number, min: 0, max: 11 }, // 0 = January, 11 = December
    endDate: { type: Date },
    count: { type: Number, min: 1 },
  },
  { _id: false }
);

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String },
    registrationRequired: { type: Boolean, default: false },
    registrationUrl: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: RecurrencePatternSchema,
  },
  { timestamps: true }
);

export default mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);
