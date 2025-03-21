// app/api/admin/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db/connect";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define a simple schema for the admin user if not already defined elsewhere
// In a real project, you'd import this from your models directory
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Use the existing model or create a new one
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if an admin already exists with this email
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: "An admin with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    // Return success response (omit password)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin user",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
