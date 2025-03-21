"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditSermonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    id: "",
    thumbnailUrl: "",
    publishedDate: "",
    speaker: "",
    category: "sermon",
    tags: "",
    featured: false,
  });

  // Fetch sermon data on page load
  useEffect(() => {
    const fetchSermon = async () => {
      try {
        const response = await fetch(`/api/sermons/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch sermon");
        }

        const data = await response.json();

        if (data.success && data.sermon) {
          // Format date for the date input
          const publishedDate = new Date(data.sermon.publishedDate);
          const formattedDate = publishedDate.toISOString().split("T")[0];

          // Format tags for the input
          const tagsString = Array.isArray(data.sermon.tags)
            ? data.sermon.tags.join(", ")
            : "";

          setFormData({
            title: data.sermon.title || "",
            description: data.sermon.description || "",
            id: data.sermon.id || "",
            thumbnailUrl: data.sermon.thumbnailUrl || "",
            publishedDate: formattedDate,
            speaker: data.sermon.speaker || "",
            category: data.sermon.category || "sermon",
            tags: tagsString,
            featured: Boolean(data.sermon.featured),
          });
        } else {
          setError(data.message || "Failed to fetch sermon");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSermon();
  }, [params.id]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Handle checkbox inputs
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Refresh video details from YouTube
  const refreshVideoDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/youtube/video/${formData.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch video details");
      }

      const data = await response.json();

      if (data.success && data.video) {
        // Only update certain fields, keeping others as they are
        setFormData({
          ...formData,
          title: data.video.title,
          description: data.video.description,
          thumbnailUrl: data.video.thumbnailUrl,
        });

        setMessage("Video details refreshed successfully");
      } else {
        setError(data.message || "Failed to fetch video details");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      // Prepare the data (convert tags string to array)
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const sermonData = {
        ...formData,
        tags: tagsArray.length > 0 ? tagsArray : [formData.category],
      };

      // Submit to API
      const response = await fetch(`/api/sermons/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sermonData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Sermon updated successfully");

        // Redirect after a brief delay to show the success message
        setTimeout(() => {
          router.push("/admin/sermons");
        }, 1000);
      } else {
        setError(data.message || "Failed to update sermon");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Sermon</h1>
        <div className="flex justify-center mt-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Sermon</h1>
        <Link href="/admin/sermons">
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
            Back to Sermons
          </button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* YouTube Video ID */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video ID
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="flex-grow rounded-l-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
                <button
                  type="button"
                  onClick={refreshVideoDetails}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-r-md hover:bg-blue-200"
                >
                  Refresh
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Video ID cannot be changed. Refresh to update details from
                YouTube.
              </p>
            </div>

            {/* Sermon Title */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sermon Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Speaker */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaker
              </label>
              <input
                type="text"
                name="speaker"
                value={formData.speaker}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Category */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sermon">Sermon</option>
                <option value="sunday-service">Sunday Service</option>
                <option value="bible-study">Bible Study</option>
                <option value="prayer">Prayer</option>
                <option value="youth">Youth</option>
                <option value="testimony">Testimony</option>
                <option value="worship">Worship</option>
              </select>
            </div>

            {/* Published Date */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Date
              </label>
              <input
                type="date"
                name="publishedDate"
                value={formData.publishedDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Thumbnail URL */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {formData.thumbnailUrl && (
                <div className="mt-2">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="h-16 object-cover rounded"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. faith, prayer, healing"
              />
            </div>

            {/* Featured */}
            <div className="col-span-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Feature this sermon on the homepage
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Link href="/admin/sermons">
              <button
                type="button"
                className="mr-3 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:bg-blue-400"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
