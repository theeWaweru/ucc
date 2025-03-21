"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SermonsAdminPage() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({
    loading: false,
    message: null,
    error: null,
  });

  // Fetch sermons on page load
  useEffect(() => {
    fetchSermons();
  }, []);

  async function fetchSermons() {
    try {
      setLoading(true);

      // Fetch sermons from API
      const response = await fetch("/api/sermons?limit=100");

      if (!response.ok) {
        throw new Error("Failed to fetch sermons");
      }

      const data = await response.json();

      if (data.success && data.sermons) {
        setSermons(data.sermons);
      } else {
        // Set error but still try to display mock data for development
        setError(data.message || "Failed to load sermons");

        // If in development and no sermons found, use mock data
        if (
          process.env.NODE_ENV === "development" &&
          (!data.sermons || data.sermons.length === 0)
        ) {
          setSermons(getMockSermons());
        }
      }
    } catch (err) {
      console.error("Error fetching sermons:", err);
      setError("Failed to load sermons");

      // Use mock data in development environment
      if (process.env.NODE_ENV === "development") {
        setSermons(getMockSermons());
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSyncYouTube = async () => {
    try {
      setSyncStatus({
        loading: true,
        message: "Syncing with YouTube...",
        error: null,
      });

      console.log("Starting YouTube sync process...");

      // Log the environment variables (mask the API key for security)
      console.log("Environment check:");
      console.log(
        "YOUTUBE_API_KEY exists:",
        !!process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
      );
      console.log(
        "YOUTUBE_CHANNEL_ID exists:",
        !!process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
      );

      const response = await fetch("/api/youtube/sync", {
        method: "POST",
      });

      console.log("Sync API response status:", response.status);

      // Always parse the response, even for error statuses
      const data = await response.json();
      console.log("Sync API response data:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to sync YouTube videos"
        );
      }

      setSyncStatus({
        loading: false,
        message: data.message || "Sync completed successfully",
        error: null,
      });

      // Refresh sermon list
      await fetchSermons();

      // Clear message after 5 seconds
      setTimeout(() => {
        setSyncStatus((prev) => ({ ...prev, message: null }));
      }, 5000);
    } catch (error) {
      console.error("Error syncing YouTube:", error);

      setSyncStatus({
        loading: false,
        message: null,
        error:
          error instanceof Error
            ? error.message
            : "Error syncing YouTube videos",
      });

      // Clear error after 10 seconds
      setTimeout(() => {
        setSyncStatus((prev) => ({ ...prev, error: null }));
      }, 10000);
    }
  };

  const handleFeatureToggle = async (id) => {
    try {
      // Optimistically update UI
      setSermons(
        sermons.map((sermon) =>
          sermon._id === id ? { ...sermon, featured: !sermon.featured } : sermon
        )
      );

      // Call API to update featured status
      const response = await fetch(`/api/sermons/${id}/feature`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featured: !sermons.find((s) => s._id === id)?.featured,
        }),
      });

      if (!response.ok) {
        // If failed, revert the change
        setSermons(sermons);
        throw new Error("Failed to update featured status");
      }
    } catch (err) {
      console.error("Error updating featured status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sermon?")) {
      return;
    }

    try {
      // Optimistically remove from UI
      setSermons(sermons.filter((sermon) => sermon._id !== id));

      // Call API to delete
      const response = await fetch(`/api/sermons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // If failed, reload the sermons
        await fetchSermons();
        throw new Error("Failed to delete sermon");
      }
    } catch (err) {
      console.error("Error deleting sermon:", err);
    }
  };

  // Format date for display in a more compact format for small screens
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Sermons Management</h1>
        <div className="flex justify-center mt-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-black">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Sermons Management</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSyncYouTube}
            disabled={syncStatus.loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:bg-red-400 w-full sm:w-auto"
          >
            {syncStatus.loading ? "Syncing..." : "Sync from YouTube"}
          </button>
          <Link href="/admin/sermons/new" className="w-full sm:w-auto">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
              Add New Sermon
            </button>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-4 rounded bg-red-100 text-red-800 border border-red-200">
          <div className="font-bold">Error loading sermons:</div>
          <div>{error}</div>
        </div>
      )}

      {/* Sync Status Message */}
      {syncStatus.message && (
        <div className="p-4 mb-4 rounded bg-blue-100 text-blue-800 border border-blue-200">
          {syncStatus.message}
        </div>
      )}

      {/* Sync Error Message */}
      {syncStatus.error && (
        <div className="p-4 mb-4 rounded bg-red-100 text-red-800 border border-red-200">
          <div className="font-bold">YouTube Sync Error:</div>
          <div>{syncStatus.error}</div>
          <div className="mt-2 text-sm">
            Please check that your YouTube API key and channel ID are correctly
            set in your .env.local file.
          </div>
        </div>
      )}

      {/* Desktop Table (hidden on small screens) */}
      <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Speaker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sermons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No sermons found. Click "Sync from YouTube" to import videos
                  from your YouTube channel.
                </td>
              </tr>
            ) : (
              sermons.map((sermon) => (
                <tr key={sermon._id}>
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="flex items-center">
                      <img
                        src={sermon.thumbnailUrl}
                        alt={sermon.title}
                        className="h-10 w-16 object-cover mr-3 flex-shrink-0"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sermon.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {sermon.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {sermon.speaker}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {sermon.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sermon.publishedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleFeatureToggle(sermon._id)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                        sermon.featured ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          sermon.featured ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/sermons/edit/${sermon._id}`}>
                      <span className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer">
                        Edit
                      </span>
                    </Link>
                    <button
                      onClick={() => handleDelete(sermon._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (shown only on small screens) */}
      <div className="md:hidden space-y-4">
        {sermons.length === 0 ? (
          <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
            No sermons found. Click "Sync from YouTube" to import videos from
            your YouTube channel.
          </div>
        ) : (
          sermons.map((sermon) => (
            <div
              key={sermon._id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="flex items-center p-4 border-b border-gray-200">
                <img
                  src={sermon.thumbnailUrl}
                  alt={sermon.title}
                  className="h-16 w-24 object-cover mr-3 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {sermon.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">ID: {sermon.id}</p>
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">Speaker:</span>
                  <span className="ml-2 text-gray-900">{sermon.speaker}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Date:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDate(sermon.publishedDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Category:</span>
                  <span className="ml-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {sermon.category}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Featured:</span>
                  <span className="ml-2">
                    <button
                      onClick={() => handleFeatureToggle(sermon._id)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                        sermon.featured ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          sermon.featured ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-4 text-sm font-medium">
                <Link href={`/admin/sermons/edit/${sermon._id}`}>
                  <span className="text-blue-600 hover:text-blue-900 cursor-pointer">
                    Edit
                  </span>
                </Link>
                <button
                  onClick={() => handleDelete(sermon._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper function to generate mock data for development
function getMockSermons() {
  return [
    {
      _id: "1",
      title: "Walking in Faith",
      speaker: "Pastor John",
      category: "sermon",
      publishedDate: "2023-03-15T10:00:00Z",
      id: "mock-video-1",
      featured: true,
      thumbnailUrl: "https://i.ytimg.com/vi/mock-video-1/hqdefault.jpg",
    },
    {
      _id: "2",
      title: "The Power of Prayer",
      speaker: "Pastor Sarah",
      category: "prayer",
      publishedDate: "2023-03-08T10:00:00Z",
      id: "mock-video-2",
      featured: false,
      thumbnailUrl: "https://i.ytimg.com/vi/mock-video-2/hqdefault.jpg",
    },
    {
      _id: "3",
      title: "Sunday Service - March 1",
      speaker: "Pastor John",
      category: "sunday-service",
      publishedDate: "2023-03-01T10:00:00Z",
      id: "mock-video-3",
      featured: false,
      thumbnailUrl: "https://i.ytimg.com/vi/mock-video-3/hqdefault.jpg",
    },
  ];
}
