"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSermonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    id: "",
    thumbnailUrl: "",
    publishedDate: new Date().toISOString().split("T")[0],
    speaker: "",
    category: "sermon",
    tags: "",
    featured: false,
  });

  // YouTube video ID validation
  const [idError, setidError] = useState<string | null>(null);

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

    // Clear YouTube ID error when user types
    if (name === "id") {
      setidError(null);
    }
  };

  // Validate YouTube video ID
  const validateYouTubeId = async () => {
    const id = formData.id.trim();

    // Basic validation for YouTube ID format (11 characters)
    if (!id) {
      setidError("Video ID is required");
      return false;
    }

    // If it's a full YouTube URL, extract the ID
    if (id.includes("youtube.com") || id.includes("youtu.be")) {
      try {
        let extractedId = "";

        if (id.includes("youtube.com/watch?v=")) {
          const url = new URL(id);
          extractedId = url.searchParams.get("v") || "";
        } else if (id.includes("youtu.be/")) {
          extractedId = id.split("youtu.be/")[1].split("?")[0];
        }

        if (extractedId) {
          // Update form with extracted ID
          setFormData({ ...formData, id: extractedId });
          return true;
        } else {
          setidError("Invalid YouTube URL");
          return false;
        }
      } catch (error) {
        setidError("Invalid YouTube URL");
        return false;
      }
    }

    return true;
  };

  // Fetch video details from YouTube
  const fetchVideoDetails = async () => {
    if (!(await validateYouTubeId())) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const id = formData.id.trim();
      const response = await fetch(`/api/youtube/video/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch video details");
      }

      const data = await response.json();

      if (data.success && data.video) {
        // Update form with video details
        setFormData({
          ...formData,
          title: data.video.title,
          description: data.video.description,
          thumbnailUrl: data.video.thumbnailUrl,
          publishedDate: new Date(data.video.publishedAt)
            .toISOString()
            .split("T")[0],
        });

        setMessage("Video details fetched successfully");
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

    if (!(await validateYouTubeId())) {
      return;
    }

    setLoading(true);
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
      const response = await fetch("/api/sermons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sermonData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to sermons list
        router.push("/admin/sermons");
      } else {
        setError(data.message || "Failed to create sermon");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Sermon</h1>
        <Link href="/admin/sermons">
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
            Cancel
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
                YouTube Video ID or URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="flex-grow rounded-l-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter YouTube ID or URL"
                />
                <button
                  type="button"
                  onClick={fetchVideoDetails}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-r-md hover:bg-blue-200"
                >
                  Fetch
                </button>
              </div>
              {idError && (
                <p className="mt-1 text-sm text-red-600">{idError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Example: dQw4w9WgXcQ or
                https://www.youtube.com/watch?v=dQw4w9WgXcQ
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
                <option value="youth">SWAT Service</option>
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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:bg-blue-400"
            >
              {loading ? "Saving..." : "Save Sermon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
