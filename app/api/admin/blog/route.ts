import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Blog from "@/models/Blog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to create a slug from title
function createSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "-");
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await dbConnect();

    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments({});

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, excerpt, author, coverImage, tags, isPublished } =
      body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate slug from title
    let slug = createSlug(title);
    let slugExists = await Blog.findOne({ slug });
    let counter = 1;

    // Ensure slug is unique
    while (slugExists) {
      slug = `${createSlug(title)}-${counter}`;
      slugExists = await Blog.findOne({ slug });
      counter++;
    }

    // Set publish date if post is being published
    const publishedDate = isPublished ? new Date() : null;

    // Create blog post
    const blog = new Blog({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      author: author || session.user.name,
      coverImage,
      tags: tags || [],
      isPublished: isPublished || false,
      publishedDate,
    });

    await blog.save();

    return NextResponse.json({
      success: true,
      message: "Blog post created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
