"use client";

import React, { useState } from "react";
import { FaCalendar, FaClock, FaSync } from "react-icons/fa";
import ImageUpload from "@/components/forms/ImageUpload";

interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: string;
  count?: number;
}

interface EventFormProps {
  initialData?: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl?: string;
    registrationRequired: boolean;
    registrationUrl?: string;
    isRecurring: boolean;
    recurrencePattern?: RecurrencePattern;
  };
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    startTime: initialData?.startDate
      ? new Date(initialData.startDate).toTimeString().slice(0, 5)
      : "",
    endDate: initialData?.endDate || "",
    endTime: initialData?.endDate
      ? new Date(initialData.endDate).toTimeString().slice(0, 5)
      : "",
    location: initialData?.location || "",
    imageUrl: initialData?.imageUrl || "",
    registrationRequired: initialData?.registrationRequired || false,
    registrationUrl: initialData?.registrationUrl || "",
    isRecurring: initialData?.isRecurring || false,
    recurrencePattern: initialData?.recurrencePattern || {
      frequency: "weekly" as const,
      interval: 1,
      daysOfWeek: [0], // Sunday by default
      endDate: "",
      count: 10,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleRecurrenceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      recurrencePattern: {
        ...prev.recurrencePattern,
        [name]: type === "number" ? parseInt(value) : value,
      },
    }));
  };

  const handleDayOfWeekToggle = (day: number) => {
    const currentDays = formData.recurrencePattern.daysOfWeek || [];

    // Toggle the day
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    setFormData((prev) => ({
      ...prev,
      recurrencePattern: {
        ...prev.recurrencePattern,
        daysOfWeek: newDays,
      },
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title) errors.title = "Title is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.startTime) errors.startTime = "Start time is required";
    if (!formData.endDate) errors.endDate = "End date is required";
    if (!formData.endTime) errors.endTime = "End time is required";
    if (!formData.location) errors.location = "Location is required";

    if (formData.registrationRequired && !formData.registrationUrl) {
      errors.registrationUrl =
        "Registration URL is required when registration is enabled";
    }

    if (formData.isRecurring) {
      const { recurrencePattern } = formData;

      if (
        recurrencePattern.frequency === "weekly" &&
        (!recurrencePattern.daysOfWeek ||
          recurrencePattern.daysOfWeek.length === 0)
      ) {
        errors.daysOfWeek = "At least one day of the week must be selected";
      }

      if (recurrencePattern.interval < 1) {
        errors.interval = "Interval must be at least 1";
      }

      if (recurrencePattern.count && recurrencePattern.count < 1) {
        errors.count = "Count must be at least 1";
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Combine date and time for start and end
    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`
    );
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    // Build the data to submit
    const submitData = {
      ...formData,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
    };

    // Remove unnecessary fields
    delete submitData.startTime;
    delete submitData.endTime;

    // If not recurring, remove recurrence pattern
    if (!submitData.isRecurring) {
      delete submitData.recurrencePattern;
    } else if (submitData.recurrencePattern.endDate) {
      // Format end date for recurrence
      submitData.recurrencePattern.endDate = new Date(
        submitData.recurrencePattern.endDate
      ).toISOString();
    }

    onSubmit(submitData);
  };

  const getDayName = (day: number) => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-700 mb-2">Event Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`w-full p-2 border rounded ${
            errors.title ? "border-red-500" : ""
          }`}
          placeholder="Event Title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className={`w-full p-2 border rounded ${
            errors.description ? "border-red-500" : ""
          }`}
          rows={4}
          placeholder="Event Description"
        ></textarea>
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Start Date *</label>
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full pl-10 p-2 border rounded ${
                  errors.startDate ? "border-red-500" : ""
                }`}
              />
            </div>
          </div>
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Start Time *</label>
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaClock className="text-gray-400" />
              </div>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={`w-full pl-10 p-2 border rounded ${
                  errors.startTime ? "border-red-500" : ""
                }`}
              />
            </div>
          </div>
          {errors.startTime && (
            <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">End Date *</label>
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full pl-10 p-2 border rounded ${
                  errors.endDate ? "border-red-500" : ""
                }`}
              />
            </div>
          </div>
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">End Time *</label>
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaClock className="text-gray-400" />
              </div>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={`w-full pl-10 p-2 border rounded ${
                  errors.endTime ? "border-red-500" : ""
                }`}
              />
            </div>
          </div>
          {errors.endTime && (
            <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Location *</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className={`w-full p-2 border rounded ${
            errors.location ? "border-red-500" : ""
          }`}
          placeholder="Event Location"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Event Image</label>
        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          folder="events"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="registrationRequired"
          name="registrationRequired"
          checked={formData.registrationRequired}
          onChange={handleCheckboxChange}
          className="mr-2"
        />
        <label htmlFor="registrationRequired">Registration Required</label>
      </div>

      {formData.registrationRequired && (
        <div>
          <label className="block text-gray-700 mb-2">Registration URL *</label>
          <input
            type="text"
            name="registrationUrl"
            value={formData.registrationUrl}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded ${
              errors.registrationUrl ? "border-red-500" : ""
            }`}
            placeholder="https://example.com/register"
          />
          {errors.registrationUrl && (
            <p className="text-red-500 text-sm mt-1">
              {errors.registrationUrl}
            </p>
          )}
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          <label
            htmlFor="isRecurring"
            className="font-medium flex items-center"
          >
            <FaSync className="mr-2" /> Recurring Event
          </label>
        </div>

        {formData.isRecurring && (
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-medium mb-4">Recurrence Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Frequency</label>
                <select
                  name="frequency"
                  value={formData.recurrencePattern.frequency}
                  onChange={handleRecurrenceChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  {formData.recurrencePattern.frequency === "daily"
                    ? "Every X days"
                    : formData.recurrencePattern.frequency === "weekly"
                    ? "Every X weeks"
                    : formData.recurrencePattern.frequency === "monthly"
                    ? "Every X months"
                    : "Every X years"}
                </label>
                <input
                  type="number"
                  name="interval"
                  value={formData.recurrencePattern.interval}
                  onChange={handleRecurrenceChange}
                  min="1"
                  className={`w-full p-2 border rounded ${
                    errors.interval ? "border-red-500" : ""
                  }`}
                />
                {errors.interval && (
                  <p className="text-red-500 text-sm mt-1">{errors.interval}</p>
                )}
              </div>
            </div>

            {formData.recurrencePattern.frequency === "weekly" && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Days of Week</label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayOfWeekToggle(day)}
                      className={`px-3 py-1 rounded ${
                        formData.recurrencePattern.daysOfWeek?.includes(day)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {getDayName(day)}
                    </button>
                  ))}
                </div>
                {errors.daysOfWeek && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.daysOfWeek}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  End After (occurrences)
                </label>
                <input
                  type="number"
                  name="count"
                  value={formData.recurrencePattern.count || ""}
                  onChange={handleRecurrenceChange}
                  min="1"
                  className={`w-full p-2 border rounded ${
                    errors.count ? "border-red-500" : ""
                  }`}
                  placeholder="Number of occurrences"
                />
                {errors.count && (
                  <p className="text-red-500 text-sm mt-1">{errors.count}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Or End By Date (optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.recurrencePattern.endDate || ""}
                  onChange={handleRecurrenceChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Event"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
