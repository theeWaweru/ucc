"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export default function SermonsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 12,
  });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>(
    searchParams.get("speaker") || ""
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [speakers, setSpeakers] = useState<string[]>([]);

  // Get current page from URL or default to 1
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true);

        // Build query string based on filters
        let query = `/api/sermons?page=${page}&limit=${pagination.limit}`;

        if (selectedCategory) {
          query += `&category=${selectedCategory}`;
        }

        if (selectedSpeaker) {
          query += `&speaker=${selectedSpeaker}`;
        }

        const response = await fetch(query);

        if (!response.ok) {
          throw new Error("Failed to fetch sermons");
        }

        const data = await response.json();

        if (data.success && data.sermons) {
          setSermons(data.sermons);
          setPagination(data.pagination);

          // Collect unique categories and speakers for filters if on first page
          if (page === 1) {
            const uniqueCategories = Array.from(
              new Set(data.sermons.map((sermon: Sermon) => sermon.category))
            );
            setCategories(uniqueCategories as string[]);

            const uniqueSpeakers = Array.from(
              new Set(data.sermons.map((sermon: Sermon) => sermon.speaker))
            );
            setSpeakers(uniqueSpeakers as string[]);
          }
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
  }, [page, selectedCategory, selectedSpeaker, pagination.limit, searchParams]);

  // Apply filters and navigate
  const applyFilters = () => {
    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    if (selectedSpeaker) {
      params.set("speaker", selectedSpeaker);
    }

    // Reset to page 1 when applying filters
    params.set("page", "1");

    router.push(`/sermons?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedSpeaker("");
    router.push("/sermons");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Generate pagination links
  const getPaginationLinks = () => {
    const links = [];

    // Previous page link
    links.push(
      <li key="prev">
        {pagination.currentPage > 1 ? (
          <Link
            href={`/sermons?page=${pagination.currentPage - 1}${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ""}`}
            className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Previous
          </Link>
        ) : (
          <span className="px-3 py-2 rounded-md border border-gray-200 text-gray-400 cursor-not-allowed">
            Previous
          </span>
        )}
      </li>
    );

    // Page number links
    for (let i = 1; i <= pagination.totalPages; i++) {
      if (
        i === 1 ||
        i === pagination.totalPages ||
        (i >= pagination.currentPage - 1 && i <= pagination.currentPage + 1)
      ) {
        links.push(
          <li key={i}>
            <Link
              href={`/sermons?page=${i}${
                selectedCategory ? `&category=${selectedCategory}` : ""
              }${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ""}`}
              className={`px-3 py-2 rounded-md ${
                pagination.currentPage === i
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i}
            </Link>
          </li>
        );
      } else if (
        (i === 2 && pagination.currentPage > 3) ||
        (i === pagination.totalPages - 1 &&
          pagination.currentPage < pagination.totalPages - 2)
      ) {
        links.push(
          <li key={i} className="px-2 py-2 text-gray-500">
            ...
          </li>
        );
      }
    }

    // Next page link
    links.push(
      <li key="next">
        {pagination.currentPage < pagination.totalPages ? (
          <Link
            href={`/sermons?page=${pagination.currentPage + 1}${
              selectedCategory ? `&category=${selectedCategory}` : ""
            }${selectedSpeaker ? `&speaker=${selectedSpeaker}` : ""}`}
            className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Next
          </Link>
        ) : (
          <span className="px-3 py-2 rounded-md border border-gray-200 text-gray-400 cursor-not-allowed">
            Next
          </span>
        )}
      </li>
    );

    return links;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Sermons</h1>

      {/* Filters */}
      <div className="bg-gray-50 p-4 mb-8 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() +
                    category.slice(1).replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speaker
            </label>
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Speakers</option>
              {speakers.map((speaker) => (
                <option key={speaker} value={speaker}>
                  {speaker}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Sermons grid */}
          {sermons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                No sermons found matching your criteria.
              </p>
              <button
                onClick={resetFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View All Sermons
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            {sermon.category.charAt(0).toUpperCase() +
                              sermon.category.slice(1).replace(/-/g, " ")}
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <ul className="flex space-x-2">{getPaginationLinks()}</ul>
                </div>
              )}

              {/* Results count */}
              <div className="mt-4 text-center text-sm text-gray-500">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} sermons
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
