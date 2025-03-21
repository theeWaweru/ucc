"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

interface PrayerRequestFormData {
  name: string;
  email: string;
  phone: string;
  prayerRequest: string;
  isUrgent: boolean;
  isAnonymous: boolean;
}

export default function PrayerRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrayerRequestFormData>();

  const onSubmit = async (data: PrayerRequestFormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await axios.post("/api/prayer", data);

      if (response.data.success) {
        setSubmitResult({
          success: true,
          message:
            "Your prayer request has been submitted. Our prayer team will pray for you.",
        });
        reset(); // Reset form fields
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
