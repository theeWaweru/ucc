"use client";

import { useState, useEffect, useRef } from "react";

interface EnhancedYouTubeEmbedProps {
  id: string;
  title: string;
  autoplay?: boolean;
  className?: string;
}

const EnhancedYouTubeEmbed: React.FC<EnhancedYouTubeEmbedProps> = ({
  id,
  title,
  autoplay = false,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlayerError, setHasPlayerError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Parameters for the YouTube embed
  const embedParams = [
    "rel=0", // Don't show related videos
    "modestbranding=1", // Hide YouTube logo
    "color=white", // Use white progress bar
    "iv_load_policy=3", // Hide video annotations
    "enablejsapi=1", // Enable JavaScript API
    autoplay ? "autoplay=1" : "", // Autoplay if specified
    "playsinline=1", // Play inline on mobile
    "hl=en", // Set language to English
    "origin=" +
      encodeURIComponent(
        typeof window !== "undefined" ? window.location.origin : ""
      ), // Add origin parameter for security
  ]
    .filter(Boolean)
    .join("&");

  useEffect(() => {
    setIsLoading(true);
    setHasPlayerError(false);

    // Reset when video ID changes
    if (iframeRef.current) {
      iframeRef.current.src = `https://www.youtube.com/embed/${id}?${embedParams}`;
    }

    // Add event listeners for YouTube player (if needed)
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;

      try {
        const data = JSON.parse(event.data);
        if (data.event === "onReady") {
          setIsLoading(false);
        }
        if (data.event === "onError") {
          setHasPlayerError(true);
          setIsLoading(false);
        }
      } catch (e) {
        // Not a JSON message from YouTube
      }
    };

    window.addEventListener("message", handleMessage);

    // Simulate loading completion after a timeout (fallback)
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(loadingTimeout);
    };
  }, [id, embedParams]);

  if (hasPlayerError) {
    return (
      <div className="relative pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
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
          <h3 className="text-xl font-bold mb-2">Video Unavailable</h3>
          <p>
            This video could not be loaded. It may have been removed or is
            currently unavailable.
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden shadow-lg ${className}`}
    >
      {/* YouTube Iframe */}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${id}?${embedParams}`}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
      ></iframe>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-white mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-white text-sm font-medium">
              Loading video...
            </span>
          </div>
        </div>
      )}

      {/* Custom Play Button Overlay (Optional) */}
      {/* This can be enhanced with a custom play button using a YouTube API */}
    </div>
  );
};

export default EnhancedYouTubeEmbed;
