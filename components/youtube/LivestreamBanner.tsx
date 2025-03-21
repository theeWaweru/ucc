"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LiveStream {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export default function LivestreamBanner() {
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [upcomingStream, setUpcomingStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const response = await fetch("/api/youtube/live");

        if (!response.ok) {
          throw new Error("Failed to check live stream status");
        }

        const data = await response.json();

        if (data.live) {
          setLiveStream(data.live);
        } else {
          setLiveStream(null);
        }

        if (data.upcoming) {
          setUpcomingStream(data.upcoming);
        } else {
          setUpcomingStream(null);
        }
      } catch (error) {
        console.error("Error checking live stream status:", error);
        setError("Failed to check live stream status");
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkLiveStatus();

    // Set up interval to check every 5 minutes
    const intervalId = setInterval(checkLiveStatus, 5 * 60 * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format date for upcoming streams
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  // If we're still loading and it's the first check, don't show anything
  if (loading && !liveStream && !upcomingStream) {
    return null;
  }

  // If there's a live stream, show the live banner
  if (liveStream) {
    return (
      <div className="bg-red-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <div className="relative">
                  <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 h-3 w-3 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="font-medium">
                We're LIVE now! {liveStream.title}
              </div>
            </div>
            <Link
              href={`https://www.youtube.com/watch?v=${liveStream.id}`}
              target="_blank"
            >
              <button className="bg-white text-red-600 px-4 py-1 rounded text-sm font-medium hover:bg-gray-100">
                Watch Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If there's an upcoming stream, show the upcoming banner
  if (upcomingStream) {
    return (
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="font-medium">
                Upcoming Live: {upcomingStream.title} •{" "}
                {formatDate(upcomingStream.scheduledStartTime || "")}
              </div>
            </div>
            <Link
              href={`https://www.youtube.com/watch?v=${upcomingStream.id}`}
              target="_blank"
            >
              <button className="bg-white text-blue-600 px-4 py-1 rounded text-sm font-medium hover:bg-gray-100">
                Set Reminder
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If neither live nor upcoming, don't show anything
  return null;
}
