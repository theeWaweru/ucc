"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EnhancedYouTubeEmbed from "@/components/youtube/EnhancedYouTubeEmbed";
import YouTubeFallback from "@/components/youtube/YouTubeFallback";

interface SermonData {
  _id: string;
  title: string;
  description: string;
  videoId: string;
  speaker: string;
  category: string;
  publishedDate: string;
  tags: string[];
  featured: boolean;
  thumbnailUrl: string;
}

export default function SermonDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [sermon, setSermon] = useState<SermonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedSermons, setRelatedSermons] = useState<SermonData[]>([]);
  const [videoError, setVideoError] = useState(false);

  // Store the id in a ref to avoid the warning
  const sermonId = params?.id;

  // Create a memoized fetchSermon function to avoid recreating it on each render
  const fetchSermon = useCallback(async () => {
    if (!sermonId) {
      setError("No sermon ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sermons/${sermonId}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/sermons");
          return;
        }
        throw new Error("Failed to fetch sermon");
      }

      const data = await response.json();

      if (data.success && data.sermon) {
        setSermon(data.sermon);

        // Fetch related sermons by the same speaker or category
        const relatedResponse = await fetch(
          `/api/sermons?category=${data.sermon.category}&limit=3`
        );

        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();

          // Filter out the current sermon and limit to 3
          const filteredSermons = relatedData.sermons
            .filter((s: SermonData) => s._id !== data.sermon._id)
            .slice(0, 3);

          setRelatedSermons(filteredSermons);
        }
      } else {
        setError(data.message || "Failed to fetch sermon");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [sermonId, router]);

  // Fetch sermon on mount
  useEffect(() => {
    fetchSermon();
  }, [fetchSermon]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Sermon not found"}
        </div>
        <Link href="/sermons">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Back to Sermons
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/sermons">
          <button className="text-blue-600 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Sermons
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Video Player */}
          {videoError || !sermon.videoId ? (
            <YouTubeFallback videoId={sermon.videoId} title={sermon.title} />
          ) : (
            <div className="relative">
              <iframe
                src={`https://www.youtube.com/embed/${sermon.videoId}?rel=0&modestbranding=1&color=white&iv_load_policy=3&playsinline=1`}
                className="w-full aspect-video rounded-lg shadow-lg mb-6"
                title={sermon.title}
                allowFullScreen
                onError={handleVideoError}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
              ></iframe>

              {/* Fallback link */}
              <div className="mt-2 mb-6 text-right">
                <a
                  href={`https://www.youtube.com/watch?v=${sermon.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          )}

          {/* Sermon Details */}
          <h1 className="text-3xl font-bold mb-2">{sermon.title}</h1>
          <div className="flex items-center mb-4">
            <span className="text-gray-600 mr-4">{sermon.speaker}</span>
            <span className="text-gray-600">
              {formatDate(sermon.publishedDate)}
            </span>
          </div>

          {/* Tags */}
          <div className="mb-6 flex flex-wrap">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2">
              {sermon.category}
            </span>
            {sermon.tags &&
              sermon.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2"
                >
                  {tag}
                </span>
              ))}
          </div>

          {/* Description */}
          <div className="prose max-w-none">
            {sermon.description.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Share this sermon</h3>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      window.location.href
                    )}`,
                    "_blank"
                  )
                }
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                aria-label="Share on Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      sermon.title
                    )}&url=${encodeURIComponent(window.location.href)}`,
                    "_blank"
                  )
                }
                className="bg-blue-400 text-white p-2 rounded hover:bg-blue-500"
                aria-label="Share on Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `${sermon.title} - ${window.location.href}`
                    )}`,
                    "_blank"
                  )
                }
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                aria-label="Share on WhatsApp"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                aria-label="Copy link"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Related Sermons */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Related Sermons</h3>

            {relatedSermons.length > 0 ? (
              <div className="space-y-4">
                {relatedSermons.map((relatedSermon) => (
                  <Link
                    href={`/sermons/${relatedSermon._id}`}
                    key={relatedSermon._id}
                    className="block group"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 w-20 h-12 overflow-hidden rounded mr-3">
                        <img
                          src={relatedSermon.thumbnailUrl}
                          alt={relatedSermon.title}
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium group-hover:text-blue-600 line-clamp-2">
                          {relatedSermon.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(relatedSermon.publishedDate)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No related sermons found.</p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link href="/sermons">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All Sermons
                </button>
              </Link>
            </div>
          </div>

          {/* Speaker Info */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">{sermon.speaker}</h3>
            <Link
              href={`/sermons?speaker=${encodeURIComponent(sermon.speaker)}`}
            >
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Sermons by {sermon.speaker}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
