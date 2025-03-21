// In app/api/admin/analytics/pageviews/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import PageView from "@/models/PageView";
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
    const path = searchParams.get("path");

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

    // Filter by path if provided
    if (path) {
      query.path = path;
    }

    // Get total pageviews
    const totalPageviews = await PageView.countDocuments(query);

    // Get pageviews by date
    const pageviewsByDate = await PageView.aggregate([
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

    // Get top pages
    const topPages = await PageView.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$path",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get referrers
    const referrers = await PageView.aggregate([
      { $match: { ...query, referrer: { $ne: "" } } },
      {
        $group: {
          _id: "$referrer",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Format the pageviews by date for charting
    const formattedPageviewsByDate = pageviewsByDate.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(
        2,
        "0"
      )}-${String(item._id.day).padStart(2, "0")}`,
      count: item.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalPageviews,
        pageviewsByDate: formattedPageviewsByDate,
        topPages,
        referrers,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
