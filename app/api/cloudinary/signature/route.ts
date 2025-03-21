import { NextResponse } from "next/server";
import { generateSignature } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    // Verify the user is authenticated before generating a signature
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "general";

    // Generate a timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Generate the signature
    const signature = generateSignature(timestamp, folder);

    return NextResponse.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
      },
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
