import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  transactionId: string;
  amount: number;
  phoneNumber: string;
  category: "tithe" | "offering" | "campaign";
  campaignName?: string;
  fullName?: string;
  email?: string;
  status: "pending" | "completed" | "failed";
  mpesaReceiptNumber?: string;
}

const PaymentSchema: Schema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["tithe", "offering", "campaign"],
    },
    campaignName: { type: String },
    fullName: { type: String },
    email: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    mpesaReceiptNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
