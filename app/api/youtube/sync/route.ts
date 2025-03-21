import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import axios from "axios";
import mongoose from "mongoose";

// Define sermon schema for direct MongoDB access
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

export async function POST(request) {
  try {
    // Check if YouTube API key and channel ID are configured
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    console.log("Debug - API Key:", YOUTUBE_API_KEY ? "Set" : "Not set");
    console.log("Debug - Channel ID:", YOUTUBE_CHANNEL_ID ? "Set" : "Not set");

    if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
      return NextResponse.json(
        {
          success: false,
          message:
            "YouTube API is not properly configured. Please add YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID to your .env.local file.",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    try {
      // Get latest videos (smaller test to check connectivity)
      console.log("Debug - Attempting to fetch videos from YouTube API");
      const videosResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            key: YOUTUBE_API_KEY,
            channelId: YOUTUBE_CHANNEL_ID,
            part: "snippet",
            maxResults: 50, // Start with just 5 for testing
            order: "date",
            type: "video",
          },
        }
      );

      console.log(`Debug - API Response status: ${videosResponse.status}`);
      console.log(
        `Debug - Found ${videosResponse.data.items?.length || 0} videos`
      );

      // If we get here, the API is working
      if (
        !videosResponse.data.items ||
        videosResponse.data.items.length === 0
      ) {
        return NextResponse.json({
          success: true,
          message: "No videos found on the channel.",
          newCount: 0,
          updatedCount: 0,
        });
      }

      // Process the videos
      let newCount = 0;
      let updatedCount = 0;

      for (const item of videosResponse.data.items) {
        // Extract video details
        const id = item.id.id;
        const snippet = item.snippet;

        // Parse video details
        const { category, speaker } = parseSermonDetails(
          snippet.title,
          snippet.description
        );

        try {
          // Check if sermon already exists
          const existingSermon = await Sermon.findOne({ id });

          if (existingSermon) {
            // Update existing sermon
            await Sermon.updateOne(
              { id },
              {
                title: snippet.title,
                description: snippet.description,
                thumbnailUrl:
                  snippet.thumbnails.high?.url ||
                  snippet.thumbnails.default.url,
                publishedDate: new Date(snippet.publishedAt),
                isLivestream: false,
                isUpcoming: false,
                category,
                speaker,
                tags: [category],
              }
            );
            updatedCount++;
          } else {
            // Create new sermon
            await Sermon.create({
              title: snippet.title,
              description: snippet.description,
              id,
              thumbnailUrl:
                snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
              publishedDate: new Date(snippet.publishedAt),
              isLivestream: false,
              isUpcoming: false,
              category,
              speaker,
              tags: [category],
              featured: false,
            });
            newCount++;
          }
        } catch (err) {
          console.error(`Error processing video ${id}:`, err);
        }
      }

      return NextResponse.json({
        success: true,
        message: `YouTube sync completed: ${newCount} new sermons added, ${updatedCount} sermons updated.`,
        newCount,
        updatedCount,
      });
    } catch (apiError) {
      console.error("Error calling YouTube API:", apiError);
      console.error("Error response:", apiError.response?.data);

      // Return detailed error information
      return NextResponse.json(
        {
          success: false,
          message: "Error calling YouTube API",
          error: apiError.message,
          details: apiError.response?.data || "No additional details",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error syncing YouTube videos:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error syncing YouTube videos",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Helper function to parse video details for speaker and category
function parseSermonDetails(title, description) {
  // Default values
  let category = "sermon";
  let speaker = "Pastor";

  // Try to extract speaker name - common format is "Speaker Name - Sermon Title"
  const speakerMatch = title.match(/^([^-]+)-/);
  if (speakerMatch && speakerMatch[1].trim()) {
    speaker = speakerMatch[1].trim();
  }

  // Try to determine category based on keywords
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();

  if (
    lowerTitle.includes("sunday service") ||
    lowerDesc.includes("sunday service")
  ) {
    category = "sunday-service";
  } else if (
    lowerTitle.includes("bible study") ||
    lowerDesc.includes("bible study")
  ) {
    category = "bible-study";
  } else if (
    lowerTitle.includes("prayer") ||
    lowerDesc.includes("prayer meeting")
  ) {
    category = "prayer";
  } else if (lowerTitle.includes("youth") || lowerDesc.includes("youth")) {
    category = "youth";
  } else if (
    lowerTitle.includes("testimony") ||
    lowerDesc.includes("testimony")
  ) {
    category = "testimony";
  } else if (lowerTitle.includes("worship") || lowerDesc.includes("worship")) {
    category = "worship";
  }

  return { category, speaker };
}
