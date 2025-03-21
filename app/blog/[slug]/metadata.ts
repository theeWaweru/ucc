import { Metadata } from "next";
import { generateMetadata as baseGenerateMetadata } from "@/lib/metadata";
import dbConnect from "@/lib/db/connect";
import Blog from "@/models/Blog";

// Generate dynamic metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  await dbConnect();
  const blog = await Blog.findOne({ slug, isPublished: true });

  if (!blog) {
    return baseGenerateMetadata({
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
      pathname: `/blog/${slug}`,
    });
  }

  // Extract keywords from tags
  const keywords = [
    ...blog.tags,
    "blog",
    "church blog",
    "article",
    "Kiambu",
    "Kenya",
    "Christian",
  ];

  // Create a plain text excerpt for description (strip HTML)
  const description = blog.excerpt.replace(/<[^>]+>/g, "");

  return baseGenerateMetadata({
    title: blog.title,
    description: description,
    keywords: keywords,
    image: blog.coverImage || "/images/og-image.jpg",
    type: "article",
    pathname: `/blog/${slug}`,
  });
}
