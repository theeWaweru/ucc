"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Sermon {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  id: string;
  speaker: string;
  category: string;
  publishedDate: string;
  featured: boolean;
}

export default function LatestSermons({
  limit = 3,
  featured = false,
  showMoreLink = true,
}: {
  limit?: number;
  featured?: boolean;
  showMoreLink?: boolean;
}) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        let url = `/api/sermons?limit=${limit}`;
        if (featured) {
          url += "&featured=true";
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch sermons");
        }

        const data = await response.json();

        if (data.success && data.sermons) {
          setSermons(data.sermons);
        } else {
          setError(data.message || "Failed to fetch sermons");
        }
      } catch (error) {
        console.error("Error fetching sermons:", error);
        setError("Failed to fetch sermons");
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, [limit, featured]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (sermons.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500 text-center">
          {featured ? "No featured sermons found" : "No sermons found"}
        </p>
        {featured && (
          <div className="text-center mt-4">
            <Link href="/sermons">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View All Sermons
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sermons.map((sermon) => (
          <Link href={`/sermons/${sermon._id}`} key={sermon._id}>
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <div className="relative">
                <img
                  src={sermon.thumbnailUrl}
                  alt={sermon.title}
                  className="w-full h-48 object-cover"
                />
                {sermon.featured && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Featured
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white text-sm font-medium">
                    {sermon.category}
                  </div>
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold mb-2 line-clamp-2">
                  {sermon.title}
                </h3>
                <div className="text-sm text-gray-600 mb-2">
                  {sermon.speaker}
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {sermon.description}
                </p>
                <div className="text-xs text-gray-400 mt-auto">
                  {formatDate(sermon.publishedDate)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showMoreLink && (
        <div className="text-center mt-8">
          <Link href="/sermons">
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              View All Sermons
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
