// models/Sermon.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISermon extends Document {
  title: string;
  description: string;
  id: string;
  thumbnailUrl: string;
  publishedDate: Date;
  speaker: string;
  category: string;
  tags: string[];
  isLivestream: boolean;
  isUpcoming: boolean;
  viewCount?: number;
  duration?: string; // e.g., "PT1H30M45S" in ISO 8601 duration format
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SermonSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    thumbnailUrl: { type: String, required: true },
    publishedDate: { type: Date, required: true },
    speaker: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "sermon",
        "sunday-service",
        "bible-study",
        "prayer",
        "youth",
        "testimony",
        "worship",
      ],
      default: "sermon",
    },
    tags: [{ type: String }],
    isLivestream: { type: Boolean, default: false },
    isUpcoming: { type: Boolean, default: false },
    viewCount: { type: Number },
    duration: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Sermon ||
  mongoose.model<ISermon>("Sermon", SermonSchema);
