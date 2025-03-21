// app/api/youtube/latest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLatestVideos } from "@/lib/api/youtube";

export async function GET(request: NextRequest) {
  try {
    // Check if YouTube API is configured
    if (!process.env.YOUTUBE_API_KEY || !process.env.YOUTUBE_CHANNEL_ID) {
      return NextResponse.json(
        {
          error: "YouTube API not configured",
          message: "YouTube API key and channel ID must be configured in .env.local",
          mockData: true,
          videos: generateMockVideos(20) // Provide mock data for development
        },
        { status: 200 }
      );
    }

    // If you had actual YouTube integration working:
    // const count = new URL(request.url).searchParams.get('count') || '10';
    // const videos = await getLatestVideos(parseInt(count));
    // return NextResponse.json({ videos });

    // For now, return mock data
    const count = new URL(request.url).searchParams.get('count') || '10';
    return NextResponse.json({ 
      videos: generateMockVideos(parseInt(count)),
      mockData: true
    });
  } catch (error) {
    console.error("Error in YouTube latest API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest videos", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Generates mock video data for development until YouTube API is set up
function generateMockVideos(count = 10) {
  const videos = [];
  
  for (let i = 0; i < count; i++) {
    videos.push({
      id: `mock-video-${i}`,
      title: `Sunday Service - Sample Sermon ${i + 1}`,
      description: "This is a sample sermon description for development purposes.",
      publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      thumbnailUrl: `https://i.ytimg.com/vi/mock-video-${i}/hqdefault.jpg`,
    });
  }
  
  return videos;
}