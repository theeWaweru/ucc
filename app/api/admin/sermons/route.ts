import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Sermon from "@/models/Sermon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const sermons = await Sermon.find({}).sort({ publishedDate: -1 });

    return NextResponse.json({
      success: true,
      data: sermons,
    });
  } catch (error) {
    console.error("Error fetching sermons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sermons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      id,
      thumbnailUrl,
      publishedDate,
      speaker,
      tags,
      isLivestream,
    } = body;

    if (
      !title ||
      !description ||
      !id ||
      !thumbnailUrl ||
      !publishedDate ||
      !speaker
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if sermon with id already exists
    const existingSermon = await Sermon.findOne({ id });

    if (existingSermon) {
      return NextResponse.json(
        { success: false, error: "Sermon with this video ID already exists" },
        { status: 400 }
      );
    }

    // Create new sermon
    const sermon = new Sermon({
      title,
      description,
      id,
      thumbnailUrl,
      publishedDate: new Date(publishedDate),
      speaker,
      tags: tags || [],
      isLivestream: isLivestream || false,
    });

    await sermon.save();

    return NextResponse.json({
      success: true,
      message: "Sermon created successfully",
      data: sermon,
    });
  } catch (error) {
    console.error("Error creating sermon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create sermon" },
      { status: 500 }
    );
  }
}
