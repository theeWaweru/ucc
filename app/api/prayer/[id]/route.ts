import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import PrayerRequest from "@/models/PrayerRequest";
import { sendPrayerRequestStatusUpdate } from "@/lib/email";
import { updatePrayerRequestStatus } from "@/lib/api/sheets";

// GET a specific prayer request by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch the prayer request by ID
    const prayerRequest = await PrayerRequest.findById(params.id);

    if (!prayerRequest) {
      return NextResponse.json(
        { success: false, error: "Prayer request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prayerRequest,
    });
  } catch (error) {
    console.error("Error fetching prayer request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch prayer request" },
      { status: 500 }
    );
  }
}

// UPDATE a prayer request
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();

    // Validate the request body
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: "No update data provided" },
        { status: 400 }
      );
    }

    // Find the prayer request first to check if it exists
    const existingRequest = await PrayerRequest.findById(params.id);

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Prayer request not found" },
        { status: 404 }
      );
    }

    // If status is being updated to completed, store the previous status
    let wasCompleted = false;
    if (body.status === "completed" && existingRequest.status !== "completed") {
      wasCompleted = true;
    }

    // Update the prayer request in MongoDB
    const updatedPrayerRequest = await PrayerRequest.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    // Also update in Google Sheets if status is changed
    if (body.status) {
      try {
        await updatePrayerRequestStatus(params.id, body.status);
      } catch (sheetError) {
        console.error(
          "Failed to update prayer request status in Google Sheets:",
          sheetError
        );
        // Continue even if sheet update fails
      }
    }

    // Notify the person who submitted the request if status changed to completed
    if (wasCompleted && !existingRequest.isAnonymous && existingRequest.email) {
      try {
        await sendPrayerRequestStatusUpdate(existingRequest);
      } catch (emailError) {
        console.error(
          "Failed to send completion notification email:",
          emailError
        );
        // Continue with the request even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedPrayerRequest,
    });
  } catch (error) {
    console.error("Error updating prayer request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update prayer request" },
      { status: 500 }
    );
  }
}

// DELETE a prayer request
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Find the prayer request first to check if it exists
    const existingRequest = await PrayerRequest.findById(params.id);

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Prayer request not found" },
        { status: 404 }
      );
    }

    // Delete the prayer request
    await PrayerRequest.findByIdAndDelete(params.id);

    // Note: We don't delete from Google Sheets to maintain historical records

    return NextResponse.json({
      success: true,
      message: "Prayer request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting prayer request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete prayer request" },
      { status: 500 }
    );
  }
}
