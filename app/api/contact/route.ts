import { NextResponse } from "next/server";
import { addContactFormSubmission } from "@/lib/api/sheets";
import { sendContactFormNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add submission to Google Sheets
    await addContactFormSubmission({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Send email notifications
    await sendContactFormNotification({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
