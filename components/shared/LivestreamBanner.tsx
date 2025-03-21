"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlay, FaCalendarAlt } from "react-icons/fa";

interface Stream {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  scheduledStartTime?: string;
}

interface LivestreamState {
  isLive: boolean;
  isUpcoming?: boolean;
  stream?: Stream;
}

export default function LivestreamBanner() {
  const [liveState, setLiveState] = useState<LivestreamState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkLiveStatus();

    // Refresh live status every 5 minutes
    const intervalId = setInterval(checkLiveStatus, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const checkLiveStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/youtube/live");
      const data = await response.json();

      if (data.success) {
        setLiveState(data.data);
      } else {
        setError("Failed to check live status");
      }
    } catch (err) {
      setError("An error occurred while checking live status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // If loading with no data, don't show anything
  if (loading && !liveState) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  // If no livestream data or error, return null
  if (error || !liveState || (!liveState.isLive && !liveState.isUpcoming)) {
    return null;
  }

  const stream = liveState.stream;
  if (!stream) return null;

  // Show different banner based on live or upcoming status
  if (liveState.isLive) {
    return (
      <div className="rounded-lg overflow-hidden shadow-md bg-red-50 border border-red-200">
        <div className="md:flex">
          <div className="md:w-1/3 relative">
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold animate-pulse">
              LIVE NOW
            </div>
          </div>
          <div className="p-6 md:w-2/3">
            <h3 className="text-xl font-bold mb-2">{stream.title}</h3>
            <p className="mb-4">
              Our service is live right now! Join us for worship and the Word.
            </p>
            <Link
              href={`/sermons/${stream.id}`}
              className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              <FaPlay className="mr-2" /> Watch Live
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (liveState.isUpcoming) {
    return (
      <div className="rounded-lg overflow-hidden shadow-md bg-blue-50 border border-blue-200">
        <div className="md:flex">
          <div className="md:w-1/3 relative">
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <h3 className="text-xl font-bold mb-2">{stream.title}</h3>
            <div className="flex items-center text-gray-600 mb-4">
              <FaCalendarAlt className="mr-2" />
              <span>
                Scheduled for {formatScheduledTime(stream.publishedAt)}
              </span>
            </div>
            <p className="mb-4">
              Join us for our upcoming service. Set a reminder so you don't miss
              it!
            </p>
            <Link
              href={`https://www.youtube.com/watch?v=${stream.id}`}
              target="_blank"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Set Reminder
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
