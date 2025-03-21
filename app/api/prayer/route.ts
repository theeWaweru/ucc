import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import PrayerRequest from "@/models/PrayerRequest";
import { sendPrayerRequestEmails } from "@/lib/email/prayer-notifications";
import { addPrayerRequest } from "@/lib/api/sheets";

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();
    const { name, email, phone, prayerRequest, isUrgent, isAnonymous } = body;

    // Validate the request
    if (!prayerRequest) {
      return NextResponse.json(
        { success: false, error: "Prayer request is required" },
        { status: 400 }
      );
    }

    // For anonymous submissions, we still need name and email for confirmation
    // but we will not store it in the database
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and email are required for all prayer requests",
        },
        { status: 400 }
      );
    }

    // Create a new prayer request in the database
    // For anonymous submissions, we store "Anonymous" but keep the real info for the email
    const newPrayerRequest = await PrayerRequest.create({
      name: isAnonymous ? "Anonymous" : name,
      email: isAnonymous ? "" : email, // Don't store email if anonymous
      phone: isAnonymous ? "" : phone, // Don't store phone if anonymous
      prayerRequest,
      isUrgent: isUrgent || false,
      isAnonymous: isAnonymous || false,
      status: "new",
    });

    // Record to Google Sheets
    try {
      await addPrayerRequest({
        id: newPrayerRequest._id.toString(),
        name: isAnonymous ? "Anonymous" : name,
        email: isAnonymous ? "redacted@privacy.org" : email, // Use placeholder for anonymous
        phone: isAnonymous ? "redacted" : phone || "",
        prayerRequest,
        isUrgent: isUrgent || false,
        isAnonymous: isAnonymous || false,
        status: "new",
      });
    } catch (sheetError) {
      console.error(
        "Failed to add prayer request to Google Sheets:",
        sheetError
      );
      // Continue even if sheet recording fails
    }

    // Send notification emails to both admin and submitter
    // Use original data for email notifications even if submission is anonymous
    try {
      await sendPrayerRequestEmails({
        name, // Use actual name for email notifications
        email, // Use actual email for notifications
        phone,
        prayerRequest,
        isUrgent: isUrgent || false,
        isAnonymous: isAnonymous || false,
      });
    } catch (emailError) {
      console.error("Failed to send notification emails:", emailError);
      // Continue with the request even if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Prayer request submitted successfully",
      data: { id: newPrayerRequest._id },
    });
  } catch (error) {
    console.error("Error submitting prayer request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit prayer request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const isUrgent = url.searchParams.get("urgent");
    const countOnly = url.searchParams.get("count") === "true";

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (isUrgent === "true") {
      query.isUrgent = true;
    }

    // Return only the count if requested
    if (countOnly) {
      const count = await PrayerRequest.countDocuments(query);
      return NextResponse.json({
        success: true,
        count,
      });
    }

    // Fetch prayer requests
    const prayerRequests = await PrayerRequest.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .limit(100);

    return NextResponse.json({
      success: true,
      data: prayerRequests,
    });
  } catch (error) {
    console.error("Error fetching prayer requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch prayer requests" },
      { status: 500 }
    );
  }
}
