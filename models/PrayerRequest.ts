import mongoose, { Schema, Document } from "mongoose";

export interface IPrayerRequest extends Document {
  name: string;
  email: string;
  phone?: string;
  prayerRequest: string;
  isUrgent: boolean;
  isAnonymous: boolean;
  status: "new" | "in-progress" | "completed";
  adminNotes?: string;
  prayedBy?: string[];
  category: string;
  wantFollowUp: boolean;
  followUpStatus?: "pending" | "scheduled" | "completed";
  followUpDate?: Date;
  followUpNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrayerRequestSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: function (this: { isAnonymous: boolean }) {
        return !this.isAnonymous;
      },
    },
    email: {
      type: String,
      required: function (this: { isAnonymous: boolean }) {
        return !this.isAnonymous;
      },
    },
    phone: {
      type: String,
      required: false,
    },
    prayerRequest: {
      type: String,
      required: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "completed"],
      default: "new",
    },
    adminNotes: {
      type: String,
      required: false,
    },
    prayedBy: [
      {
        type: String,
        required: false,
      },
    ],
    // New fields for enhanced functionality
    category: {
      type: String,
      enum: [
        "personal",
        "health",
        "family",
        "financial",
        "spiritual",
        "relationships",
        "career",
        "grief",
        "other",
      ],
      default: "personal",
    },
    wantFollowUp: {
      type: Boolean,
      default: false,
    },
    followUpStatus: {
      type: String,
      enum: ["pending", "scheduled", "completed"],
      default: "pending",
    },
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// This prevents error when model is already defined
export default mongoose.models.PrayerRequest ||
  mongoose.model<IPrayerRequest>("PrayerRequest", PrayerRequestSchema);
