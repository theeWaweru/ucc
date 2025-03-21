// In app/admin/events/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EventForm from "@/components/forms/EventForm";
import { FaArrowLeft } from "react-icons/fa";

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { id } = params;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/events/${id}`);
      const data = await response.json();

      if (data.success) {
        // Format dates for the form
        const event = data.data;

        // Convert ISO dates to YYYY-MM-DD format for date inputs
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        setEvent({
          ...event,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          // If the event has recurrence with an end date, format it
          recurrencePattern: event.recurrencePattern && {
            ...event.recurrencePattern,
            endDate: event.recurrencePattern.endDate
              ? new Date(event.recurrencePattern.endDate)
                  .toISOString()
                  .split("T")[0]
              : undefined,
          },
        });
      } else {
        setError("Failed to fetch event");
      }
    } catch (err) {
      setError("An error occurred while fetching the event");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/events");
      } else {
        setError(data.error || "Failed to update event");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-center">
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-700">{error || "Event not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.push("/admin/events")}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
