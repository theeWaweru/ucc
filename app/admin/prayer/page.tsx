"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FaSpinner,
  FaEye,
  FaBell,
  FaExclamationTriangle,
} from "react-icons/fa";

interface PrayerRequest {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  prayerRequest: string;
  isUrgent: boolean;
  isAnonymous: boolean;
  status: "new" | "in-progress" | "completed";
  adminNotes?: string;
  prayedBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminPrayerRequestsPage() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const router = useRouter();

  // Fetch prayer requests
  useEffect(() => {
    const fetchPrayerRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query params
        let queryParams = new URLSearchParams();
        if (statusFilter !== "all") {
          queryParams.append("status", statusFilter);
        }
        if (showUrgentOnly) {
          queryParams.append("urgent", "true");
        }

        const response = await axios.get(
          `/api/prayer?${queryParams.toString()}`
        );

        if (response.data.success) {
          setPrayerRequests(response.data.data);
        } else {
          setError(response.data.error || "Failed to fetch prayer requests");
        }
      } catch (err: any) {
        console.error("Error fetching prayer requests:", err);
        setError(
          err.message || "Something went wrong. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerRequests();
  }, [statusFilter, showUrgentOnly]);

  // Function to update request status
  const updateStatus = async (
    id: string,
    status: "new" | "in-progress" | "completed"
  ) => {
    try {
      const response = await axios.patch(`/api/prayer/${id}`, { status });

      if (response.data.success) {
        // Update the local state
        setPrayerRequests((prevRequests) =>
          prevRequests.map((req) => (req._id === id ? { ...req, status } : req))
        );
      } else {
        setError(response.data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating prayer request status:", err);
      setError("Something went wrong when updating the status.");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // View request details
  const viewDetails = (id: string) => {
    router.push(`/admin/prayer/${id}`);
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
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
    <div>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Prayer Requests
          </h1>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex items-center">
              <input
                id="urgentOnly"
                type="checkbox"
                checked={showUrgentOnly}
                onChange={(e) => setShowUrgentOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="urgentOnly"
                className="ml-2 text-sm text-gray-700"
              >
                Urgent only
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}

        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <FaSpinner className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2 text-gray-500">
                      Loading prayer requests...
                    </p>
                  </div>
                </div>
              ) : prayerRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No prayer requests found matching your criteria.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Request
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Priority
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prayerRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {request.isAnonymous ? "Anonymous" : request.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="line-clamp-2">
                            {request.prayerRequest}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(
                              request.status
                            )}`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1).replace("-", " ")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {request.isUrgent ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                              <FaBell className="mr-1" /> Urgent
                            </span>
                          ) : (
                            "Normal"
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => viewDetails(request._id)}
                            className="text-blue-600 hover:text-blue-900 mr-4 flex items-center h-full"
                          >
                            <FaEye className="mr-1" /> View
                          </button>
                          <select
                            value={request.status}
                            onChange={(e) =>
                              updateStatus(
                                request._id,
                                e.target.value as
                                  | "new"
                                  | "in-progress"
                                  | "completed"
                              )
                            }
                            className="rounded border-gray-300 text-sm text-black"
                          >
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
