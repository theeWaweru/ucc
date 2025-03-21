import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import mongoose from "mongoose";

// Use the existing model or create a new one
const Sermon =
  mongoose.models.Sermon ||
  mongoose.model("Sermon", new mongoose.Schema({}, { strict: false }));

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Use params.id in a proper async context
    const id = params.id; // This is now correct since we're in an async function

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid sermon ID" },
        { status: 400 }
      );
    }

    // Find sermon by ID
    const sermon = await Sermon.findById(id);

    if (!sermon) {
      return NextResponse.json(
        { success: false, message: "Sermon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sermon,
    });
  } catch (error) {
    console.error("Error fetching sermon:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching sermon",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();

    // Update sermon
    const sermon = await Sermon.findByIdAndUpdate(id, body, { new: true });

    if (!sermon) {
      return NextResponse.json(
        { success: false, message: "Sermon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sermon updated successfully",
      sermon,
    });
  } catch (error) {
    console.error("Error updating sermon:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating sermon",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete sermon
    const sermon = await Sermon.findByIdAndDelete(id);

    if (!sermon) {
      return NextResponse.json(
        { success: false, message: "Sermon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sermon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sermon:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting sermon",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
