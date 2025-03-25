"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

interface PrayerStats {
  total: number;
  byStatus: {
    new: number;
    inProgress: number;
    completed: number;
  };
  byCategory: Record<string, number>;
  byUrgency: {
    urgent: number;
    normal: number;
  };
  recentTrends: {
    lastWeek: number;
    lastMonth: number;
    twoMonthsAgo: number;
  };
}

const initialStats: PrayerStats = {
  total: 0,
  byStatus: {
    new: 0,
    inProgress: 0,
    completed: 0,
  },
  byCategory: {},
  byUrgency: {
    urgent: 0,
    normal: 0,
  },
  recentTrends: {
    lastWeek: 0,
    lastMonth: 0,
    twoMonthsAgo: 0,
  },
};

export default function PrayerStatsDashboard() {
  const [stats, setStats] = useState<PrayerStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would make an API call to get these stats
      // For now, we'll simulate it with sample data
      // const response = await axios.get("/api/admin/prayer/statistics");
      // const data = response.data;

      // Simulate API response
      setTimeout(() => {
        const data = {
          success: true,
          data: {
            total: 89,
            byStatus: {
              new: 23,
              inProgress: 41,
              completed: 25,
            },
            byCategory: {
              personal: 15,
              health: 28,
              family: 12,
              financial: 7,
              spiritual: 9,
              relationships: 8,
              career: 5,
              grief: 3,
              other: 2,
            },
            byUrgency: {
              urgent: 18,
              normal: 71,
            },
            recentTrends: {
              lastWeek: 12,
              lastMonth: 37,
              twoMonthsAgo: 28,
            },
          },
        };

        if (data.success) {
          setStats(data.data);
        } else {
          setError("Failed to fetch prayer request statistics");
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching prayer stats:", err);
      setError("Something went wrong. Please try again later.");
      setLoading(false);
    }
  };

  // Function to get percentage
  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Function to get color class based on status
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "inProgress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to get color class based on category
  const getCategoryColorClass = (category: string) => {
    const colorMap: Record<string, string> = {
      personal: "bg-indigo-500",
      health: "bg-red-500",
      family: "bg-green-500",
      financial: "bg-yellow-500",
      spiritual: "bg-purple-500",
      relationships: "bg-pink-500",
      career: "bg-blue-500",
      grief: "bg-gray-500",
      other: "bg-teal-500",
    };

    return colorMap[category] || "bg-gray-500";
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labelMap: Record<string, string> = {
      personal: "Personal",
      health: "Health & Healing",
      family: "Family",
      financial: "Financial",
      spiritual: "Spiritual Growth",
      relationships: "Relationships",
      career: "Career & Work",
      grief: "Grief & Loss",
      other: "Other",
    };

    return labelMap[category] || category;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-blue-600 h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">{error}</div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Prayer Request Overview</h2>
          <p className="text-gray-500 text-sm">
            Current statistics for all prayer requests
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-4">Status Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>New</span>
                    <span>
                      {stats.byStatus.new} (
                      {getPercentage(stats.byStatus.new, stats.total)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${getPercentage(
                          stats.byStatus.new,
                          stats.total
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>In Progress</span>
                    <span>
                      {stats.byStatus.inProgress} (
                      {getPercentage(stats.byStatus.inProgress, stats.total)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${getPercentage(
                          stats.byStatus.inProgress,
                          stats.total
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Completed</span>
                    <span>
                      {stats.byStatus.completed} (
                      {getPercentage(stats.byStatus.completed, stats.total)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${getPercentage(
                          stats.byStatus.completed,
                          stats.total
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-4">Urgency</h3>
              <div className="flex justify-between items-end h-40">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 flex flex-col items-center">
                    <div
                      className="w-16 bg-red-500 rounded-t-md"
                      style={{
                        height: `${
                          (stats.byUrgency.urgent / stats.total) * 120
                        }px`,
                      }}
                    ></div>
                    <span className="mt-2 text-sm font-medium">Urgent</span>
                    <span className="text-sm text-gray-500">
                      {stats.byUrgency.urgent}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-24 flex flex-col items-center">
                    <div
                      className="w-16 bg-blue-500 rounded-t-md"
                      style={{
                        height: `${
                          (stats.byUrgency.normal / stats.total) * 120
                        }px`,
                      }}
                    ></div>
                    <span className="mt-2 text-sm font-medium">Normal</span>
                    <span className="text-sm text-gray-500">
                      {stats.byUrgency.normal}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trends */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-4">Recent Trends</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Last 7 Days</span>
                    <span>{stats.recentTrends.lastWeek}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.recentTrends.lastWeek / stats.total) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Last 30 Days</span>
                    <span>{stats.recentTrends.lastMonth}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.recentTrends.lastMonth / stats.total) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Previous 30 Days</span>
                    <span>{stats.recentTrends.twoMonthsAgo}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.recentTrends.twoMonthsAgo / stats.total) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Prayer Request Categories</h2>
          <p className="text-gray-500 text-sm">
            Distribution of prayer requests by category
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div
                key={category}
                className="flex items-center p-3 border rounded-md"
              >
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${getCategoryColorClass(
                    category
                  )}`}
                ></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {getCategoryLabel(category)}
                    </span>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`${getCategoryColorClass(
                        category
                      )} h-1.5 rounded-full`}
                      style={{ width: `${getPercentage(count, stats.total)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.push("/admin/prayer")}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          View All Prayer Requests
        </button>

        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
        >
          Refresh Statistics
        </button>
      </div>
    </div>
  );
}
