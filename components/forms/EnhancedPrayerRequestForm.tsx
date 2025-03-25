"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

// Prayer request categories
const PRAYER_CATEGORIES = [
  { id: "personal", label: "Personal" },
  { id: "health", label: "Health & Healing" },
  { id: "family", label: "Family" },
  { id: "financial", label: "Financial" },
  { id: "spiritual", label: "Spiritual Growth" },
  { id: "relationships", label: "Relationships" },
  { id: "career", label: "Career & Work" },
  { id: "grief", label: "Grief & Loss" },
  { id: "other", label: "Other" },
];

interface PrayerRequestFormData {
  name: string;
  email: string;
  phone: string;
  prayerRequest: string;
  isUrgent: boolean;
  isAnonymous: boolean;
  category: string;
  wantFollowUp: boolean;
}

export default function EnhancedPrayerRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showSuccessDetails, setShowSuccessDetails] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PrayerRequestFormData>({
    defaultValues: {
      category: "personal",
      wantFollowUp: false,
    },
  });

  const wantFollowUp = watch("wantFollowUp");

  const onSubmit = async (data: PrayerRequestFormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);
    setShowSuccessDetails(false);

    try {
      const response = await axios.post("/api/prayer", data);

      if (response.data.success) {
        setSubmitResult({
          success: true,
          message:
            "Your prayer request has been submitted. Our prayer team will pray for you.",
        });
        reset(); // Reset form fields
        setShowSuccessDetails(true);
      } else {
        setSubmitResult({
          success: false,
          message:
            response.data.error ||
            "Failed to submit prayer request. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting prayer request:", error);
      setSubmitResult({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnonymous(e.target.checked);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitResult && (
        <div
          className={`p-4 rounded-md ${
            submitResult.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {submitResult.message}

          {submitResult.success && showSuccessDetails && (
            <div className="mt-4 pt-4 border-t border-green-100">
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  Your prayer request has been received by our prayer team
                </li>
                <li>Our team will begin praying for your request</li>
                {wantFollowUp && (
                  <li>
                    A prayer team member will follow up with you within 7 days
                  </li>
                )}
                <li>You'll receive an email confirmation of your submission</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowSuccessDetails(false)}
                className="text-green-700 underline text-sm mt-2"
              >
                Hide details
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-4 mb-6">
        <div className="flex h-6 items-center">
          <input
            id="isAnonymous"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            {...register("isAnonymous")}
            onChange={handleAnonymousChange}
          />
        </div>
        <div className="text-sm leading-6">
          <label htmlFor="isAnonymous" className="font-medium text-gray-900">
            Submit anonymously
          </label>
          <p className="text-gray-500">
            Check this if you prefer not to share your personal information.
          </p>
        </div>
      </div>

      {!isAnonymous && (
        <>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              {...register("name", { required: !isAnonymous })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">Name is required</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              {...register("email", {
                required: !isAnonymous,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message || "Email is required"}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone (optional)
            </label>
            <input
              id="phone"
              type="tel"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              {...register("phone")}
            />
          </div>
        </>
      )}

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Prayer Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          {...register("category", { required: true })}
        >
          {PRAYER_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">Please select a category</p>
        )}
      </div>

      <div>
        <label
          htmlFor="prayerRequest"
          className="block text-sm font-medium text-gray-700"
        >
          Prayer Request <span className="text-red-500">*</span>
        </label>
        <textarea
          id="prayerRequest"
          rows={5}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Share your prayer request here..."
          {...register("prayerRequest", { required: true })}
        ></textarea>
        {errors.prayerRequest && (
          <p className="mt-1 text-sm text-red-600">
            Prayer request is required
          </p>
        )}
      </div>

      <div className="flex items-start">
        <div className="flex h-6 items-center">
          <input
            id="isUrgent"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            {...register("isUrgent")}
          />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="isUrgent" className="font-medium text-gray-900">
            This is an urgent request
          </label>
        </div>
      </div>

      {!isAnonymous && (
        <div className="flex items-start">
          <div className="flex h-6 items-center">
            <input
              id="wantFollowUp"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              {...register("wantFollowUp")}
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label htmlFor="wantFollowUp" className="font-medium text-gray-900">
              I would like someone to follow up with me about this request
            </label>
            <p className="text-gray-500">
              A prayer team member will contact you within 7 days.
            </p>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {isSubmitting ? "Submitting..." : "Submit Prayer Request"}
        </button>
      </div>
    </form>
  );
}
