// app/api/youtube/live/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if YouTube API is configured
    if (!process.env.YOUTUBE_API_KEY || !process.env.YOUTUBE_CHANNEL_ID) {
      return NextResponse.json(
        {
          error: "YouTube API not configured",
          message:
            "YouTube API key and channel ID must be configured in .env.local",
          mockData: true,
          live: null,
          upcoming: getMockUpcomingStream(),
          isLive: false,
          hasUpcoming: true,
        },
        { status: 200 }
      );
    }

    // If you had actual YouTube integration working:
    // const liveStreams = await getLiveStreams();
    // const upcomingStreams = await getUpcomingLiveStreams();
    // return NextResponse.json({
    //   live: liveStreams.length > 0 ? liveStreams[0] : null,
    //   upcoming: upcomingStreams.length > 0 ? upcomingStreams[0] : null,
    //   isLive: liveStreams.length > 0,
    //   hasUpcoming: upcomingStreams.length > 0,
    // });

    // For now, return mock data
    return NextResponse.json({
      live: null, // No active livestream
      upcoming: getMockUpcomingStream(),
      isLive: false,
      hasUpcoming: true,
      mockData: true,
    });
  } catch (error) {
    console.error("Error in YouTube live API route:", error);
    return NextResponse.json(
      {
        error: "Failed to get live stream status",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Generates a mock upcoming stream for development
function getMockUpcomingStream() {
  // Set upcoming stream for next Sunday at 10 AM
  const now = new Date();
  const nextSunday = new Date();
  nextSunday.setDate(now.getDate() + (7 - now.getDay()));
  nextSunday.setHours(10, 0, 0, 0);

  return {
    id: "mock-upcoming-stream",
    title: "Sunday Service - Live Stream",
    description: "Join us for our Sunday service live stream.",
    publishedAt: nextSunday.toISOString(),
    thumbnailUrl: "https://i.ytimg.com/vi/mock-upcoming-stream/hqdefault.jpg",
    scheduledStartTime: nextSunday.toISOString(),
  };
}
