"use client";

import { useEffect, useState } from "react";
import {
  FaVideo,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaPray,
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import YouTubeSync from "@/components/admin/YouTubeSync";

export default function Adminboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    sermons: 0,
    events: 0,
    payments: 0,
    prayerRequests: 0,
  });

  useEffect(() => {
    // In a real implementation, you would fetch these stats from your API
    setStats({
      sermons: 42,
      events: 12,
      payments: 156,
      prayerRequests: 89,
    });
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaVideo size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Sermons</p>
              <p className="text-2xl font-bold">{stats.sermons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaCalendarAlt size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Upcoming Events</p>
              <p className="text-2xl font-bold">{stats.events}</p>
            </div>
          </div>
        </div>

        {session?.user?.role === "admin" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaMoneyBillWave size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Total Payments</p>
                <p className="text-2xl font-bold">{stats.payments}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaPray size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Prayer Requests</p>
              <p className="text-2xl font-bold">{stats.prayerRequests}</p>
            </div>
          </div>
        </div>
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {/* Placeholder for upcoming events */}
            <div className="border-b pb-2">
              <p className="font-medium">Easter Service</p>
              <p className="text-sm text-gray-500">April 9, 2023</p>
            </div>
            <div className="border-b pb-2">
              <p className="font-medium">Youth Conference</p>
              <p className="text-sm text-gray-500">June 15-17, 2023</p>
            </div>
            <div>
              <p className="font-medium">Community Outreach</p>
              <p className="text-sm text-gray-500">July 22, 2023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
