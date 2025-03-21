import { NextResponse } from "next/server";
import {
  getCurrentLiveStream,
  getNextScheduledService,
} from "@/lib/api/youtube";

export async function GET() {
  try {
    // Check for current livestream
    const livestream = await getCurrentLiveStream();

    if (livestream) {
      return NextResponse.json({
        success: true,
        data: {
          isLive: true,
          stream: livestream,
        },
      });
    }

    // If no livestream, check for upcoming streams
    const upcomingStream = await getNextScheduledService();

    if (upcomingStream) {
      return NextResponse.json({
        success: true,
        data: {
          isLive: false,
          stream: upcomingStream,
        },
      });
    }

    // No live or upcoming streams
    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error("Error fetching livestream data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch livestream data" },
      { status: 500 }
    );
  }
}
