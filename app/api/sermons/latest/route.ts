// app/api/sermons/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db/connect";

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const category = url.searchParams.get("category") || null;
    const featured = url.searchParams.get("featured") === "true";

    // If the database connection fails or there's no YouTube data yet,
    // we can return mock data for development purposes
    const mockData = generateMockSermons(page, limit, category, featured);

    // In a real implementation, you would:
    // 1. Connect to database
    // await dbConnect();
    // 2. Query for sermons with pagination
    // const sermons = await Sermon.find({...})
    //   .skip((page - 1) * limit)
    //   .limit(limit)
    //   .sort({ publishedDate: -1 });
    // 3. Get total count for pagination
    // const total = await Sermon.countDocuments({...});

    // For now, return mock data with pagination info
    return NextResponse.json({
      sermons: mockData,
      pagination: {
        currentPage: page,
        totalPages: 5,
        totalItems: 45,
        limit: limit,
      },
      mockData: true,
    });
  } catch (error) {
    console.error("Error fetching sermons:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sermons",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Generate mock sermon data for development purposes
function generateMockSermons(
  page = 1,
  limit = 10,
  category: string | null = null,
  featured = false
) {
  const sermons = [];
  const categories = [
    "sermon",
    "sunday-service",
    "bible-study",
    "prayer",
    "youth",
    "testimony",
    "worship",
  ];
  const speakers = [
    "Pastor John",
    "Pastor Sarah",
    "Elder David",
    "Minister Rebecca",
    "Guest Speaker",
  ];

  // Calculate offset based on pagination
  const startIndex = (page - 1) * limit;

  // Generate random sermons
  for (let i = 0; i < limit; i++) {
    const index = startIndex + i;
    const date = new Date();
    date.setDate(date.getDate() - index * 3); // Sermons every 3 days

    const randomCategoryIndex = index % categories.length;
    const selectedCategory = category || categories[randomCategoryIndex];
    const speakerIndex = index % speakers.length;

    sermons.push({
      _id: `mock-sermon-${index}`,
      title: `${
        selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
      } - Topic ${index + 1}`,
      description:
        "This is a sample sermon description for development purposes.",
      id: `mock-video-${index}`,
      thumbnailUrl: `https://i.ytimg.com/vi/mock-video-${index}/hqdefault.jpg`,
      publishedDate: date.toISOString(),
      speaker: speakers[speakerIndex],
      category: selectedCategory,
      tags: [selectedCategory, "mock"],
      isLivestream: false,
      isUpcoming: false,
      viewCount: Math.floor(Math.random() * 1000) + 100,
      duration: "PT1H15M30S",
      featured: featured || index < 3,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }

  return sermons;
}
