"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";
import { useForm } from "react-hook-form";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/contact", {
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
          result.error || "An error occurred while submitting the form."
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
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-4 mt-1">
                    <FaMapMarkerAlt size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Location</h3>
                    <p>123 Church Street, Kiambu, Kenya</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-blue-600 mr-4 mt-1">
                    <FaPhone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Phone</h3>
                    <p>+254 722 282892</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-blue-600 mr-4 mt-1">
                    <FaEnvelope size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p>info@uhaicenter.church</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-blue-600 mr-4 mt-1">
                    <FaClock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Service Times</h3>
                    <p>Sunday: 9:00 AM - 12:00 PM</p>
                    <p>Wednesday: 6:00 PM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-300 h-64 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Google Map will be embedded here</p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

              {isSuccess ? (
                <div className="bg-green-100 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="mb-4">
                    Thank you for reaching out. We will get back to you as soon
                    as possible.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
                      {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className="w-full p-2 border rounded"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 mt-1">{errors.name.message}</p>
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
                      <p className="text-red-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      {...register("phone")}
                      className="w-full p-2 border rounded"
                      placeholder="07XX XXX XXX"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      {...register("subject", {
                        required: "Subject is required",
                      })}
                      className="w-full p-2 border rounded"
                      placeholder="How can we help you?"
                    />
                    {errors.subject && (
                      <p className="text-red-500 mt-1">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Message</label>
                    <textarea
                      {...register("message", {
                        required: "Message is required",
                      })}
                      className="w-full p-2 border rounded"
                      rows={6}
                      placeholder="Type your message here..."
                    ></textarea>
                    {errors.message && (
                      <p className="text-red-500 mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
