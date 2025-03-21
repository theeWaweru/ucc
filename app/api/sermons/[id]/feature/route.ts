import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import mongoose from "mongoose";

// Use the existing model or create a new one
const Sermon =
  mongoose.models.Sermon ||
  mongoose.model("Sermon", new mongoose.Schema({}, { strict: false }));

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    const id = params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid sermon ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const { featured } = await request.json();

    // Update sermon featured status
    const sermon = await Sermon.findByIdAndUpdate(
      id,
      { featured },
      { new: true } // Return updated document
    );

    if (!sermon) {
      return NextResponse.json(
        { success: false, message: "Sermon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sermon ${featured ? "featured" : "unfeatured"} successfully`,
      sermon,
    });
  } catch (error) {
    console.error("Error updating sermon featured status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating sermon featured status",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
