"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FaSpinner,
  FaBell,
  FaCheck,
  FaClock,
  FaCalendarAlt,
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
  category: string;
  wantFollowUp: boolean;
  followUpStatus?: "pending" | "scheduled" | "completed";
  followUpDate?: string;
  followUpNotes?: string;
  adminNotes?: string;
  prayedBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function PrayerFollowUpSystem() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpStatus, setFollowUpStatus] = useState<
    "pending" | "scheduled" | "completed"
  >("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPrayerRequests();
  }, [filterStatus]);

  const fetchPrayerRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would make an API call to get these requests
      // For now, we'll simulate it with sample data
      // const response = await axios.get(`/api/admin/prayer/follow-up?status=${filterStatus}`);

      // Simulate API delay
      setTimeout(() => {
        // Mock data
        const mockRequests: PrayerRequest[] = [
          {
            _id: "1",
            name: "John Smith",
            email: "john@example.com",
            phone: "1234567890",
            prayerRequest: "Please pray for my upcoming surgery next week.",
            isUrgent: true,
            isAnonymous: false,
            status: "in-progress",
            category: "health",
            wantFollowUp: true,
            followUpStatus: "pending",
            adminNotes: "John has been a church member for 5 years.",
            prayedBy: ["admin@uhaicentre.church"],
            createdAt: "2025-03-15T14:30:00.000Z",
            updatedAt: "2025-03-18T10:15:00.000Z",
          },
          {
            _id: "2",
            name: "Mary Johnson",
            email: "mary@example.com",
            phone: "0987654321",
            prayerRequest: "Prayer for my son who is struggling with school.",
            isUrgent: false,
            isAnonymous: false,
            status: "in-progress",
            category: "family",
            wantFollowUp: true,
            followUpStatus: "scheduled",
            followUpDate: "2025-03-25T09:00:00.000Z",
            adminNotes: "First-time visitor to our church.",
            prayedBy: ["admin@uhaicentre.church"],
            createdAt: "2025-03-16T09:45:00.000Z",
            updatedAt: "2025-03-18T14:20:00.000Z",
          },
          {
            _id: "3",
            name: "David Wilson",
            email: "david@example.com",
            phone: "1122334455",
            prayerRequest:
              "Seeking spiritual direction for a major life decision.",
            isUrgent: false,
            isAnonymous: false,
            status: "in-progress",
            category: "spiritual",
            wantFollowUp: true,
            followUpStatus: "completed",
            followUpDate: "2025-03-19T15:30:00.000Z",
            followUpNotes:
              "Called David and prayed with him. He's feeling more peace about his decision.",
            adminNotes: "Regular attendee, part of men's ministry.",
            prayedBy: ["admin@uhaicentre.church", "pastor@uhaicentre.church"],
            createdAt: "2025-03-12T11:20:00.000Z",
            updatedAt: "2025-03-19T16:45:00.000Z",
          },
          {
            _id: "4",
            name: "Sarah Brown",
            email: "sarah@example.com",
            phone: "5566778899",
            prayerRequest: "Prayer for new job opportunity.",
            isUrgent: false,
            isAnonymous: false,
            status: "new",
            category: "career",
            wantFollowUp: true,
            followUpStatus: "pending",
            adminNotes: "",
            prayedBy: [],
            createdAt: "2025-03-20T08:15:00.000Z",
            updatedAt: "2025-03-20T08:15:00.000Z",
          },
          {
            _id: "5",
            name: "Michael Lee",
            email: "michael@example.com",
            phone: "3344556677",
            prayerRequest: "Prayer for healing from chronic back pain.",
            isUrgent: true,
            isAnonymous: false,
            status: "in-progress",
            category: "health",
            wantFollowUp: true,
            followUpStatus: "scheduled",
            followUpDate: "2025-03-26T14:00:00.000Z",
            adminNotes: "Has requested prayer for this issue before.",
            prayedBy: ["admin@uhaicentre.church"],
            createdAt: "2025-03-18T16:40:00.000Z",
            updatedAt: "2025-03-20T09:30:00.000Z",
          },
        ];

        // Filter based on status
        const filteredRequests = mockRequests.filter((req) => {
          if (filterStatus === "all") return true;
          return req.followUpStatus === filterStatus;
        });

        setPrayerRequests(filteredRequests);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching prayer requests for follow-up:", err);
      setError("Something went wrong. Please try again later.");
      setLoading(false);
    }
  };

  const openFollowUpModal = (request: PrayerRequest) => {
    setSelectedRequest(request);
    setFollowUpNotes(request.followUpNotes || "");
    setFollowUpDate(
      request.followUpDate
        ? new Date(request.followUpDate).toISOString().slice(0, 16)
        : ""
    );
    setFollowUpStatus(request.followUpStatus || "pending");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsSubmitting(true);

    try {
      // In a real implementation, you would make an API call to update the follow-up status
      // const response = await axios.patch(`/api/admin/prayer/${selectedRequest._id}/follow-up`, {
      //   followUpStatus,
      //   followUpDate: followUpDate ? new Date(followUpDate).toISOString() : undefined,
      //   followUpNotes,
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state with the updated request
      setPrayerRequests((prev) =>
        prev.map((req) =>
          req._id === selectedRequest._id
            ? {
                ...req,
                followUpStatus,
                followUpDate: followUpDate
                  ? new Date(followUpDate).toISOString()
                  : undefined,
                followUpNotes,
              }
            : req
        )
      );

      // Close modal and reset form
      closeModal();

      // Success message (in a real app, you might use a toast notification)
      alert("Follow-up status updated successfully");
    } catch (err) {
      console.error("Error updating follow-up status:", err);
      alert("Failed to update follow-up status. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  // Get status badge class and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          badgeClass: "bg-yellow-100 text-yellow-800",
          icon: <FaClock className="mr-1" />,
          text: "Pending",
        };
      case "scheduled":
        return {
          badgeClass: "bg-blue-100 text-blue-800",
          icon: <FaCalendarAlt className="mr-1" />,
          text: "Scheduled",
        };
      case "completed":
        return {
          badgeClass: "bg-green-100 text-green-800",
          icon: <FaCheck className="mr-1" />,
          text: "Completed",
        };
      default:
        return {
          badgeClass: "bg-gray-100 text-gray-800",
          icon: null,
          text: status.charAt(0).toUpperCase() + status.slice(1),
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Prayer Request Follow-ups</h1>

        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Follow-ups</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={fetchPrayerRequests}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <FaSpinner className="animate-spin text-blue-600 h-8 w-8" />
          </div>
        ) : prayerRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No prayer requests found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follow-up Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follow-up Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prayerRequests.map((request) => {
                  const statusInfo = getStatusInfo(
                    request.followUpStatus || "pending"
                  );

                  return (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {request.category}
                        </span>
                        {request.isUrgent && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <FaBell className="mr-1" /> Urgent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.icon} {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.followUpDate
                          ? formatDate(request.followUpDate)
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openFollowUpModal(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Update Follow-up
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Follow-up Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Update Follow-up Status</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFollowUpSubmit}>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="font-medium mb-2">Prayer Request Details</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">From:</span>{" "}
                    {selectedRequest.name}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Category:</span>{" "}
                    {selectedRequest.category}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Request:</span>{" "}
                    {selectedRequest.prayerRequest}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Submitted:</span>{" "}
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Status
                  </label>
                  <select
                    value={followUpStatus}
                    onChange={(e) =>
                      setFollowUpStatus(
                        e.target.value as "pending" | "scheduled" | "completed"
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {followUpStatus === "scheduled" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required={followUpStatus === "scheduled"}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Notes
                  </label>
                  <textarea
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add notes about your follow-up conversation..."
                  ></textarea>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      const contactInfo = `Name: ${selectedRequest.name}
                        Email: ${selectedRequest.email}
                        Phone: ${selectedRequest.phone || "Not provided"}`;
                      alert(`Contact Information:\n${contactInfo}`);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    View Contact Info
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/admin/prayer/${selectedRequest._id}`)
                    }
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                  >
                    View Full Request
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSubmitting ? "Saving..." : "Save Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
