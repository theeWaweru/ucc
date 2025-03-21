"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/components/forms/EventForm";
import { FaArrowLeft } from "react-icons/fa";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/events");
      } else {
        setError(data.error || "Failed to create event");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.push("/admin/events")}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <EventForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
