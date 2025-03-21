// components/admin/YouTubeSync.tsx
"use client";

import { useState } from "react";
import { FaSync } from "react-icons/fa";

export default function YouTubeSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string }>(
    {}
  );

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setResult({});

      const response = await fetch("/api/youtube/sync", {
        method: "GET",
      });

      const data = await response.json();

      setResult({
        success: data.success,
        message:
          data.message ||
          (data.success
            ? "Successfully synced videos"
            : "Failed to sync videos"),
      });
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while syncing videos",
      });
      console.error("Error syncing videos:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">YouTube Sync</h2>
      <p className="mb-4">
        Manually sync sermons from the church YouTube channel. This will fetch
        latest videos, check for livestreams, and update the database.
      </p>

      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        <FaSync className={`mr-2 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? "Syncing..." : "Sync YouTube Videos"}
      </button>

      {result.message && (
        <div
          className={`mt-4 p-3 rounded ${
            result.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
