// components/youtube/VideoGrid.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FaCalendar, FaPlay } from "react-icons/fa";

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  isLivestream?: boolean;
  isUpcoming?: boolean;
}

interface VideoGridProps {
  videos: Video[];
  className?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, className = "" }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <Link href={`/sermons/${video.id}`}>
            <div className="relative">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full aspect-video object-cover"
              />
              {video.isLivestream && (
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm animate-pulse">
                  LIVE
                </div>
              )}
              {video.isUpcoming && (
                <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded-md text-sm">
                  UPCOMING
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                <div className="p-3 bg-red-600 rounded-full">
                  <FaPlay className="text-white" size={24} />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg line-clamp-2 mb-2">
                {video.title}
              </h3>
              <div className="flex items-center text-gray-500 text-sm">
                <FaCalendar className="mr-1" />
                <span>{formatDate(video.publishedAt)}</span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
