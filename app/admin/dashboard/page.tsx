"use client";

import { useEffect, useState } from "react";
import {
  FaVideo,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPray,
  FaSpinner,
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import YouTubeSync from "@/components/admin/YouTubeSync";
import axios from "axios";
import CountUp from "react-countup";

// Recent Prayer Requests Component
function RecentPrayerRequests() {
  const [recentPrayers, setRecentPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRecentPrayers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/prayer?limit=5");
        if (response.data.success) {
          setRecentPrayers(response.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching recent prayer requests:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPrayers();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // View prayer request details
  const viewPrayerRequest = (id) => {
    router.push(`/admin/prayer/${id}`);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recent Prayer Requests</h2>
        <button
          onClick={() => router.push("/admin/prayer")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-purple-600 h-8 w-8" />
        </div>
      ) : error ? (
        <div className="text-center py-6 text-red-500">
          Error loading prayer requests
        </div>
      ) : recentPrayers.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No prayer requests found
        </div>
      ) : (
        <div className="space-y-4">
          {recentPrayers.map((prayer) => (
            <div
              key={prayer._id}
              className="border-b pb-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors duration-200"
              onClick={() => viewPrayerRequest(prayer._id)}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium">
                  {prayer.isAnonymous ? "Anonymous" : prayer.name}
                </p>
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(
                    prayer.status
                  )}`}
                >
                  {prayer.status.charAt(0).toUpperCase() +
                    prayer.status.slice(1).replace("-", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2 mb-1">
                {prayer.prayerRequest}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{formatDate(prayer.createdAt)}</span>
                {prayer.isUrgent && (
                  <span className="text-red-600 font-medium">Urgent</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Adminboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    sermons: 0,
    events: 0,
    payments: 0,
    prayerRequests: 0,
  });
  const [loading, setLoading] = useState({
    sermons: true,
    events: true,
    payments: true,
    prayerRequests: true,
  });
  const [error, setError] = useState({
    sermons: false,
    events: false,
    payments: false,
    prayerRequests: false,
  });

  useEffect(() => {
    // Fetch prayer request count
    const fetchPrayerRequestCount = async () => {
      try {
        setLoading((prev) => ({ ...prev, prayerRequests: true }));
        const response = await axios.get("/api/prayer?count=true");
        if (response.data.success) {
          // Small delay for animation effect
          setTimeout(() => {
            setStats((prev) => ({
              ...prev,
              prayerRequests: response.data.count,
            }));
            setLoading((prev) => ({ ...prev, prayerRequests: false }));
          }, 500);
        } else {
          setError((prev) => ({ ...prev, prayerRequests: true }));
          setLoading((prev) => ({ ...prev, prayerRequests: false }));
        }
      } catch (err) {
        console.error("Error fetching prayer request count:", err);
        setError((prev) => ({ ...prev, prayerRequests: true }));
        setLoading((prev) => ({ ...prev, prayerRequests: false }));
      }
    };

    // Fetch sermon count
    const fetchSermonCount = async () => {
      try {
        setLoading((prev) => ({ ...prev, sermons: true }));
        // Replace with actual API endpoint when implemented
        // const response = await axios.get("/api/sermons?count=true");
        // if (response.data.success) {
        //   setStats((prev) => ({ ...prev, sermons: response.data.count }));
        // } else {
        //   setError((prev) => ({ ...prev, sermons: true }));
        // }

        // Temp placeholder until sermon count API is implemented
        setStats((prev) => ({ ...prev, sermons: 42 }));
      } catch (err) {
        console.error("Error fetching sermon count:", err);
        setError((prev) => ({ ...prev, sermons: true }));
      } finally {
        setLoading((prev) => ({ ...prev, sermons: false }));
      }
    };

    // Fetch event count
    const fetchEventCount = async () => {
      try {
        setLoading((prev) => ({ ...prev, events: true }));
        // Replace with actual API endpoint when implemented
        // const response = await axios.get("/api/events?count=true");
        // if (response.data.success) {
        //   setStats((prev) => ({ ...prev, events: response.data.count }));
        // } else {
        //   setError((prev) => ({ ...prev, events: true }));
        // }

        // Temp placeholder until event count API is implemented
        setStats((prev) => ({ ...prev, events: 12 }));
      } catch (err) {
        console.error("Error fetching event count:", err);
        setError((prev) => ({ ...prev, events: true }));
      } finally {
        setLoading((prev) => ({ ...prev, events: false }));
      }
    };

    // Fetch payment count
    const fetchPaymentCount = async () => {
      try {
        setLoading((prev) => ({ ...prev, payments: true }));
        // Replace with actual API endpoint when implemented
        // const response = await axios.get("/api/admin/payments?count=true");
        // if (response.data.success) {
        //   setStats((prev) => ({ ...prev, payments: response.data.count }));
        // } else {
        //   setError((prev) => ({ ...prev, payments: true }));
        // }

        // Temp placeholder until payment count API is implemented
        setStats((prev) => ({ ...prev, payments: 156 }));
      } catch (err) {
        console.error("Error fetching payment count:", err);
        setError((prev) => ({ ...prev, payments: true }));
      } finally {
        setLoading((prev) => ({ ...prev, payments: false }));
      }
    };

    // Fetch all counts
    fetchPrayerRequestCount();
    fetchSermonCount();
    fetchEventCount();
    fetchPaymentCount();
  }, []);

  // Stat Card component for reusability
  const StatCard = ({ title, count, icon, color, isLoading, hasError }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color.bg} ${color.text}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-gray-500 text-sm">{title}</p>
            {isLoading ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : hasError ? (
              <span className="text-red-500 text-sm">Error loading data</span>
            ) : (
              <p className="text-2xl font-bold">
                <CountUp
                  end={count}
                  duration={2}
                  separator=","
                  delay={0.2}
                  useEasing={true}
                />
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sermons"
          count={stats.sermons}
          icon={<FaVideo size={24} />}
          color={{ bg: "bg-blue-100", text: "text-blue-600" }}
          isLoading={loading.sermons}
          hasError={error.sermons}
        />

        <StatCard
          title="Upcoming Events"
          count={stats.events}
          icon={<FaCalendarAlt size={24} />}
          color={{ bg: "bg-green-100", text: "text-green-600" }}
          isLoading={loading.events}
          hasError={error.events}
        />

        {session?.user?.role === "admin" && (
          <StatCard
            title="Total Payments"
            count={stats.payments}
            icon={<FaMoneyBillWave size={24} />}
            color={{ bg: "bg-yellow-100", text: "text-yellow-600" }}
            isLoading={loading.payments}
            hasError={error.payments}
          />
        )}

        <StatCard
          title="Prayer Requests"
          count={stats.prayerRequests}
          icon={<FaPray size={24} />}
          color={{ bg: "bg-purple-100", text: "text-purple-600" }}
          isLoading={loading.prayerRequests}
          hasError={error.prayerRequests}
        />
      </div>

      <div className="mt-6">
        <YouTubeSync />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Sermons</h2>
          <div className="space-y-4">
            {/* Placeholder for recent sermons */}
            <div className="border-b pb-2">
              <p className="font-medium">Walking in Faith</p>
              <p className="text-sm text-gray-500">March 12, 2023</p>
            </div>
            <div className="border-b pb-2">
              <p className="font-medium">Power of Prayer</p>
              <p className="text-sm text-gray-500">March 5, 2023</p>
            </div>
            <div>
              <p className="font-medium">Grace for Today</p>
              <p className="text-sm text-gray-500">February 26, 2023</p>
            </div>
          </div>
        </div>

        <RecentPrayerRequests />
      </div>
    </div>
  );
}
