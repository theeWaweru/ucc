"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useForm } from "react-hook-form";

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  amount: number;
  category: "tithe" | "offering" | "campaign";
  campaignName?: string;
}

export default function GivePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const selectedCategory = watch("category");

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        reset();
      } else {
        setError(
          result.error || "An error occurred while processing your payment."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Give to Uhai Center Church
          </h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Why We Give</h2>
            <p className="mb-4">
              At Uhai Center Church, we believe that giving is an act of
              worship. Your generosity helps us extend God's love to our
              community and beyond through various ministries and outreach
              programs.
            </p>
            <p>All donations are securely processed through M-Pesa.</p>
          </div>

          {isSuccess ? (
            <div className="bg-green-100 p-6 rounded-lg text-center">
              <h2 className="text-xl font-bold mb-4">
                Thank You for Your Generosity!
              </h2>
              <p className="mb-6">
                Your payment request has been initiated. Please check your phone
                to complete the M-Pesa transaction.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Make Another Donation
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <form onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    {...register("fullName", { required: "Name is required" })}
                    className="w-full p-2 border rounded"
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full p-2 border rounded"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Phone Number (M-Pesa)
                  </label>
                  <input
                    type="text"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^(?:254|\+254|0)?(7[0-9]{8})$/,
                        message: "Please enter a valid Kenyan phone number",
                      },
                    })}
                    className="w-full p-2 border rounded"
                    placeholder="07XX XXX XXX"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    {...register("amount", {
                      required: "Amount is required",
                      min: {
                        value: 10,
                        message: "Minimum amount is 10 KES",
                      },
                    })}
                    className="w-full p-2 border rounded"
                    placeholder="Enter amount in KES"
                  />
                  {errors.amount && (
                    <p className="text-red-500 mt-1">{errors.amount.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    {...register("category", {
                      required: "Please select a category",
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a category</option>
                    <option value="tithe">Tithe</option>
                    <option value="offering">Offering</option>
                    <option value="campaign">Special Campaign</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {selectedCategory === "campaign" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      {...register("campaignName", {
                        required:
                          "Campaign name is required for campaign donations",
                      })}
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Building Fund, Missions Project"
                    />
                    {errors.campaignName && (
                      <p className="text-red-500 mt-1">
                        {errors.campaignName.message}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Donate Now"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
