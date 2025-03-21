"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { FaCalendar, FaTag, FaUser, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

import dbConnect from "@/lib/db/connect";
import Blog from "@/models/Blog";
import Script from "next/script";

import ShareButtons from "@/components/ui/ShareButtons";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  coverImage?: string;
  tags: string[];
  publishedDate: string;
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();

      if (data.success) {
        setBlog(data.data);
      } else {
        setError("Failed to fetch blog post");
      }
    } catch (err) {
      setError("An error occurred while fetching the blog post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <p>Loading blog post...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !blog) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-700">{error || "Blog post not found"}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Script id="blog-schema" type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": "${blog.title}",
          "image": "${
            blog.coverImage || "https://uhaicentre.church/images/og-image.jpg"
          }",
          "datePublished": "${new Date(blog.publishedDate).toISOString()}",
          "dateModified": "${new Date(blog.updatedAt).toISOString()}",
          "author": {
            "@type": "Person",
            "name": "${blog.author}"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Uhai Centre Church",
            "logo": {
              "@type": "ImageObject",
              "url": "https://uhaicentre.church/logo.png"
            }
          },
          "description": "${blog.excerpt
            .replace(/<[^>]+>/g, "")
            .replace(/"/g, '\\"')}",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://uhaicentre.church/blog/${blog.slug}"
          }
        }
      `}
      </Script>

      <div className="container mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <FaArrowLeft className="mr-2" /> Back to All Posts
        </Link>

        <article className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          {blog.coverImage && (
            <div className="h-64 md:h-96 overflow-hidden">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {blog.title}
            </h1>

            <div className="flex flex-wrap gap-4 items-center text-gray-600 mb-6">
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center">
                <FaCalendar className="mr-2" />
                <span>{formatDate(blog.publishedDate)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full hover:bg-blue-200"
                  >
                    <FaTag className="inline mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            ></div>
          </div>
        </article>
        <div className="mb-6">
          <ShareButtons url={`/blog/${blog.slug}`} title={blog.title} />
        </div>
      </div>
    </MainLayout>
  );
}
