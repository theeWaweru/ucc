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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    await dbConnect();

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { title, content, excerpt, coverImage, tags, isPublished } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the blog post
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Check if title changed and update slug if needed
    if (title !== blog.title) {
      let newSlug = createSlug(title);
      let slugExists = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
      let counter = 1;

      // Ensure slug is unique
      while (slugExists) {
        newSlug = `${createSlug(title)}-${counter}`;
        slugExists = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
        counter++;
      }

      blog.slug = newSlug;
    }

    // Update publishedDate if post is being published for the first time
    if (isPublished && !blog.isPublished) {
      blog.publishedDate = new Date();
    }

    // Update fields
    blog.title = title;
    blog.content = content;
    blog.excerpt = excerpt || content.substring(0, 150) + "...";
    blog.coverImage = coverImage;
    blog.tags = tags || [];
    blog.isPublished = isPublished;

    await blog.save();

    return NextResponse.json({
      success: true,
      message: "Blog post updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    await dbConnect();

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
