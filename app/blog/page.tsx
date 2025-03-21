'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { FaCalendar, FaTag, FaUser } from 'react-icons/fa';
import Link from 'next/link';


interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  coverImage?: string;
  tags: string[];
  publishedDate: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTag, setActiveTag] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    fetchBlogs();
  }, [page, activeTag]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "6");
      if (activeTag) queryParams.append("tag", activeTag);

      const response = await fetch(`/api/blog?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data);
        setTotalPages(data.pagination.pages);

        // Extract unique tags for filter
        const tags = data.data.reduce((acc: string[], blog: Blog) => {
          blog.tags.forEach((tag) => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
          return acc;
        }, []);

        setAvailableTags(tags);
      } else {
        setError("Failed to fetch blog posts");
      }
    } catch (err) {
      setError("An error occurred while fetching blog posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Church Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest news, announcements, and spiritual
            insights from Uhai Center Church.
          </p>
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTag("")}
              className={`px-4 py-2 rounded-full ${
                activeTag === ""
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              All Posts
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full ${
                  activeTag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <p>Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No blog posts found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {blog.coverImage && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold mb-2 hover:text-blue-600">
                      <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaUser className="mr-1" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendar className="mr-1" />
                        <span>{formatDate(blog.publishedDate)}</span>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-4"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded-l disabled:opacity-50"
              >
                Previous
              </button>
              <div className="px-4 py-2 bg-gray-100">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-r disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}