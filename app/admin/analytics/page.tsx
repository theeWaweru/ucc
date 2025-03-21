"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaEye, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [period, setPeriod] = useState("7days");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [pageViewData, setPageViewData] = useState({
    totalPageviews: 0,
    pageviewsByDate: [],
    topPages: [],
    referrers: [],
  });

  const [eventData, setEventData] = useState({
    totalEvents: 0,
    eventsByCategory: [],
    topEvents: [],
    eventsByDate: [],
  });

  useEffect(() => {
    if (status === "authenticated") {
      // Check if user is admin
      if (session?.user?.role !== "admin") {
        router.push("/admin/dashboard");
        return;
      }

      fetchPageViewData();
      fetchEventData();
    }
  }, [status, router, session, period]);

  const fetchPageViewData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/analytics/pageviews?period=${period}`
      );
      const data = await response.json();

      if (data.success) {
        setPageViewData(data.data);
      } else {
        setError("Failed to fetch pageview analytics");
      }
    } catch (err) {
      setError("An error occurred while fetching pageview analytics");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/analytics/events?period=${period}`
      );
      const data = await response.json();

      if (data.success) {
        setEventData(data.data);
      } else {
        setError("Failed to fetch event analytics");
      }
    } catch (err) {
      setError("An error occurred while fetching event analytics");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const pageViewLineChartData = {
    labels: pageViewData.pageviewsByDate.map((item: any) => item.date),
    datasets: [
      {
        label: "Page Views",
        data: pageViewData.pageviewsByDate.map((item: any) => item.count),
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  const topPagesBarChartData = {
    labels: pageViewData.topPages.map((item: any) => item._id),
    datasets: [
      {
        label: "Views",
        data: pageViewData.topPages.map((item: any) => item.count),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const eventsPieChartData = {
    labels: eventData.eventsByCategory.map((item: any) => item._id),
    datasets: [
      {
        label: "Events",
        data: eventData.eventsByCategory.map((item: any) => item.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

        <div className="flex items-center">
          <span className="mr-2">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="p-2 border rounded"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading analytics data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Page Views</h2>
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <FaEye size={24} />
                </div>
              </div>
              <p className="text-4xl font-bold">
                {pageViewData.totalPageviews}
              </p>
              <p className="text-gray-500">Total views in selected period</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">User Events</h2>
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <FaChartBar size={24} />
                </div>
              </div>
              <p className="text-4xl font-bold">{eventData.totalEvents}</p>
              <p className="text-gray-500">Total events in selected period</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views Over Time */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Page Views Over Time</h2>
              <div className="h-80">
                <Line
                  data={pageViewLineChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Top Pages</h2>
              <div className="h-80">
                <Bar
                  data={topPagesBarChartData}
                  options={{
                    maintainAspectRatio: false,
                    indexAxis: "y" as const,
                    scales: {
                      x: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Event Categories */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Event Categories</h2>
              <div className="h-80">
                <Pie
                  data={eventsPieChartData}
                  options={{
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-6">Top Referrers</h2>
              {pageViewData.referrers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No referrer data available
                </p>
              ) : (
                <div className="overflow-y-auto max-h-72">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Source
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Visits
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pageViewData.referrers.map(
                        (referrer: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {referrer._id || "Direct"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {referrer.count}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
