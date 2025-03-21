// In app/api/analytics/track/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import PageView from "@/models/PageView";
import EventTracking from "@/models/EventTracking";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      path,
      referrer,
      eventName,
      eventCategory,
      eventLabel,
      eventValue,
    } = body;

    // Get IP and user agent
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await dbConnect();

    if (type === "pageview") {
      // Track page view
      await PageView.create({
        path,
        ip,
        userAgent,
        referrer: referrer || "",
        timestamp: new Date(),
      });
    } else if (type === "event") {
      // Track event
      await EventTracking.create({
        eventName,
        eventCategory,
        eventLabel,
        eventValue,
        path,
        ip,
        userAgent,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track analytics" },
      { status: 500 }
    );
  }
}
