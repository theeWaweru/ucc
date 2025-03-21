import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import mongoose from "mongoose";

// Define sermon schema
const SermonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    thumbnailUrl: { type: String, required: true },
    publishedDate: { type: Date, required: true },
    speaker: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "sermon",
        "sunday-service",
        "bible-study",
        "prayer",
        "youth",
        "testimony",
        "worship",
      ],
      default: "sermon",
    },
    tags: [{ type: String }],
    isLivestream: { type: Boolean, default: false },
    isUpcoming: { type: Boolean, default: false },
    viewCount: { type: Number },
    duration: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Use the existing model or create a new one
const Sermon = mongoose.models.Sermon || mongoose.model("Sermon", SermonSchema);

export async function GET(request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const category = url.searchParams.get("category");
    const featured = url.searchParams.get("featured") === "true";

    // Build the query
    let query = {};

    if (category) {
      query.category = category;
    }

    if (featured) {
      query.featured = true;
    }

    // Execute the query with pagination
    const skip = (page - 1) * limit;

    const sermons = await Sermon.find(query)
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Sermon.countDocuments(query);

    return NextResponse.json({
      success: true,
      sermons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching sermons:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching sermons",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "id",
      "thumbnailUrl",
      "publishedDate",
      "speaker",
      "category",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create sermon
    const sermon = await Sermon.create(body);

    return NextResponse.json({
      success: true,
      message: "Sermon created successfully",
      sermon,
    });
  } catch (error) {
    console.error("Error creating sermon:", error);

    // Handle duplicate key error
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A sermon with this video ID already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error creating sermon",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
