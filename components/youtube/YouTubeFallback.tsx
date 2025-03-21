"use client";

import React from "react";

interface YouTubeFallbackProps {
  videoId: string;
  title: string;
}

const YouTubeFallback: React.FC<YouTubeFallbackProps> = ({
  videoId,
  title,
}) => {
  return (
    <div className="relative pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center mb-6">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
        <svg
          className="w-16 h-16 mb-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-bold mb-2">Video Playback Error</h3>
        <p className="mb-6">
          There was an error playing this video on our website.
        </p>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Watch on YouTube Instead
        </a>
      </div>
    </div>
  );
};

export default YouTubeFallback;
