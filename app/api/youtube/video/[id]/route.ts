import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get YouTube API key from environment variables
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "YouTube API is not properly configured",
        },
        { status: 500 }
      );
    }

    const id = params.id;

    // Fetch video details from YouTube API
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          key: YOUTUBE_API_KEY,
          id: id,
          part: "snippet,contentDetails,statistics",
        },
      }
    );

    // Check if video exists
    if (response.data.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Video not found",
        },
        { status: 404 }
      );
    }

    // Extract video details
    const videoData = response.data.items[0];
    const snippet = videoData.snippet;
    const contentDetails = videoData.contentDetails;
    const statistics = videoData.statistics;

    // Format video details
    const video = {
      id: videoData.id,
      title: snippet.title,
      description: snippet.description,
      publishedAt: snippet.publishedAt,
      thumbnailUrl: snippet.thumbnails.high
        ? snippet.thumbnails.high.url
        : snippet.thumbnails.default.url,
      duration: contentDetails.duration,
      viewCount: statistics.viewCount,
      likeCount: statistics.likeCount,
      commentCount: statistics.commentCount,
      tags: snippet.tags || [],
    };

    // Determine speaker and category based on title/description
    const { speaker, category } = parseVideoDetails(
      snippet.title,
      snippet.description
    );
    video.speaker = speaker;
    video.category = category;

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error("Error fetching video details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching video details",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Helper function to parse video details for speaker and category
function parseVideoDetails(title: string, description: string) {
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
