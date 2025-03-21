import { NextResponse } from 'next/server';
import { syncYouTubeVideos } from '@/lib/api/youtube';

export async function GET(request: Request) {
  // In production, you'd want to secure this endpoint with a secret key
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  // Simple protection using an environment variable
  if (key !== process.env.CRON_SECRET_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const videos = await syncYouTubeVideos();

    return NextResponse.json({
      success: true,
      message: `Synced ${videos.length} videos from YouTube`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in YouTube sync cron job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync YouTube videos" },
      { status: 500 }
    );
  }
}