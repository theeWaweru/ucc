"use client";

import React from "react";

interface VideoEmbedProps {
  id: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({
  id,
  title = "YouTube video player",
  className = "",
  autoplay = false,
}) => {
  return (
    <div
      className={`aspect-video w-full overflow-hidden rounded-lg ${className}`}
    >
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${id}${
          autoplay ? "?autoplay=1" : ""
        }`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoEmbed;
