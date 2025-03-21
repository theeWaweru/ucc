import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Admin from "@/models/Admin";

export async function GET() {
  try {
    // This endpoint should only be accessible during development!
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: "This endpoint is not available in production",
        },
        { status: 403 }
      );
    }

    await dbConnect();

    // Check if any admin user already exists
    const existingAdmins = await Admin.countDocuments();

    if (existingAdmins > 0) {
      return NextResponse.json({
        success: false,
        message: "Admin users already exist",
        count: existingAdmins,
      });
    }

    // No admins exist, provide instructions
    return NextResponse.json({
      success: true,
      message: "No admin users found. Use POST to create the first admin.",
      instructions:
        "POST to this endpoint with name, email, and password to create the first admin user.",
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // This endpoint should only be accessible during development!
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: "This endpoint is not available in production",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if any admin user already exists
    const existingAdmins = await Admin.countDocuments();

    if (existingAdmins > 0) {
      return NextResponse.json(
        { success: false, error: "Admin users already exist" },
        { status: 403 }
      );
    }

    // Create the first admin user
    const admin = new Admin({
      name,
      email,
      password,
      role: "admin", // First user is always an admin
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      name: admin.name,
      email: admin.email,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
