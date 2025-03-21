// In app/admin/blog/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/forms/RichTextEditor";
import { FaSave, FaCheck, FaTimes } from "react-icons/fa";

interface BlogEditProps {
  params: {
    id: string;
  };
}

export default function EditBlogPost({ params }: BlogEditProps) {
  const { id } = params;
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    tags: "",
    isPublished: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/blog/${id}`);
      const data = await response.json();

      if (data.success) {
        const blog = data.data;
        setFormData({
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          coverImage: blog.coverImage || "",
          tags: blog.tags.join(", "),
          isPublished: blog.isPublished,
        });
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title) {
      setError("Title is required");
      return;
    }

    if (!formData.content) {
      setError("Content is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Prepare tags array
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/blog");
      } else {
        setError(data.error || "Failed to update blog post");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-center">
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <div className="flex items-center">
          <span className="mr-2 text-gray-600">
            {formData.isPublished ? "Published" : "Draft"}
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, isPublished: !formData.isPublished })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              formData.isPublished ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                formData.isPublished ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Post Title"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="coverImage">
            Cover Image URL (optional)
          </label>
          <input
            type="text"
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="tags">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="news, announcement, spiritual"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Content *</label>
          <RichTextEditor
            value={formData.content}
            onChange={handleContentChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="A brief summary of your post"
          ></textarea>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 flex items-center"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <FaSave className="mr-2" />{" "}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
