import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import EventTracking from "@/models/EventTracking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7days";
    const category = searchParams.get("category");

    await dbConnect();

    // Calculate start date based on period
    const endDate = new Date();
    let startDate: Date;
    switch (period) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "7days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0); // January 1, 1970
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    // Build query
    const query: any = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    // Filter by category if provided
    if (category) {
      query.eventCategory = category;
    }

    // Get total events
    const totalEvents = await EventTracking.countDocuments(query);

    // Get events by category
    const eventsByCategory = await EventTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$eventCategory",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get top events
    const topEvents = await EventTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            name: "$eventName",
            category: "$eventCategory",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get events by date
    const eventsByDate = await EventTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Format the events by date for charting
    const formattedEventsByDate = eventsByDate.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(
        2,
        "0"
      )}-${String(item._id.day).padStart(2, "0")}`,
      count: item.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalEvents,
        eventsByCategory,
        topEvents,
        eventsByDate: formattedEventsByDate,
      },
    });
  } catch (error) {
    console.error("Error fetching event analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event analytics" },
      { status: 500 }
    );
  }
}
