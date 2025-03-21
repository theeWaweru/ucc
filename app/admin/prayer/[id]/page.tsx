"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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

export default function PrayerRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Use React.use to unwrap the params object
  const id = React.use(Promise.resolve(params)).id;

  const [prayerRequest, setPrayerRequest] = useState<PrayerRequest | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  // Fetch prayer request details
  useEffect(() => {
    const fetchPrayerRequest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/prayer/${id}`);

        if (response.data.success) {
          setPrayerRequest(response.data.data);
          setAdminNotes(response.data.data.adminNotes || "");
        } else {
          setError(
            response.data.error || "Failed to fetch prayer request details"
          );
        }
      } catch (err) {
        console.error("Error fetching prayer request:", err);
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPrayerRequest();
    }
  }, [id]);

  // Update prayer request
  const updatePrayerRequest = async (data: Partial<PrayerRequest>) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const response = await axios.patch(`/api/prayer/${id}`, data);

      if (response.data.success) {
        setPrayerRequest((prev) => (prev ? { ...prev, ...data } : null));
        setSaveSuccess(true);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setSaveError(response.data.error || "Failed to update prayer request");
      }
    } catch (err) {
      console.error("Error updating prayer request:", err);
      setSaveError("Something went wrong when updating the prayer request.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "new" | "in-progress" | "completed";
    updatePrayerRequest({ status: newStatus });
  };

  // Handle notes change
  const handleSaveNotes = () => {
    updatePrayerRequest({ adminNotes });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Handle "Mark as Prayed For"
  const markAsPrayedFor = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Get current user's email (you may need to implement a user context)
      // This is a placeholder - replace with actual user info
      const userEmail = "admin@uhaicentre.church"; // Placeholder

      // Get current prayedBy array or empty array if none
      const currentPrayedBy = prayerRequest?.prayedBy || [];

      // Only add if not already in the array
      if (!currentPrayedBy.includes(userEmail)) {
        const newPrayedBy = [...currentPrayedBy, userEmail];
        await updatePrayerRequest({ prayedBy: newPrayedBy });
      }
    } catch (err) {
      console.error("Error marking as prayed for:", err);
      setSaveError("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-500">
              Loading prayer request details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !prayerRequest) {
    return (
      <div>
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
            {error || "Prayer request not found"}
          </div>
          <button
            onClick={() => router.push("/admin/prayer")}
            className="text-blue-600 hover:text-blue-900"
          >
            &larr; Back to Prayer Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Prayer Request Details
          </h1>
          <button
            onClick={() => router.push("/admin/prayer")}
            className="text-blue-600 hover:text-blue-900"
          >
            &larr; Back to Prayer Requests
          </button>
        </div>

        {saveError && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
            Prayer request updated successfully.
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Request Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Submitted on {formatDate(prayerRequest.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {prayerRequest.isUrgent && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  Urgent
                </span>
              )}
              <div>
                <label htmlFor="status" className="sr-only">
                  Status
                </label>
                <select
                  id="status"
                  value={prayerRequest.status}
                  onChange={handleStatusChange}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  disabled={isSaving}
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {prayerRequest.isAnonymous ? "Anonymous" : prayerRequest.name}
                </dd>
              </div>
              {!prayerRequest.isAnonymous && (
                <>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {prayerRequest.email}
                    </dd>
                  </div>
                  {prayerRequest.phone && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {prayerRequest.phone}
                      </dd>
                    </div>
                  )}
                </>
              )}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Prayer Request
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {prayerRequest.prayerRequest}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Admin Notes
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                    placeholder="Add notes about this prayer request..."
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isSaving ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Prayed For By
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {prayerRequest.prayedBy &&
                  prayerRequest.prayedBy.length > 0 ? (
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {prayerRequest.prayedBy.map((email, index) => (
                        <li
                          key={index}
                          className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                        >
                          {email}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      No one has marked this request as prayed for yet.
                    </p>
                  )}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={markAsPrayedFor}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Mark as Prayed For
                    </button>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
