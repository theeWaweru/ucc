"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { FaCalendar, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Link from "next/link";
import Script from "next/script";

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  registrationRequired: boolean;
  registrationUrl?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Filter events based on selected filter
    if (filter === "upcoming") {
      setFilteredEvents(
        events.filter((event) => new Date(event.startDate) > new Date())
      );
    } else if (filter === "past") {
      setFilteredEvents(
        events.filter((event) => new Date(event.startDate) < new Date())
      );
    } else {
      setFilteredEvents(events);
    }
  }, [filter, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      } else {
        setError("Failed to fetch events");
      }
    } catch (err) {
      setError("An error occurred while fetching events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <MainLayout>
      {events.map((event) => (
        <Script
          key={event._id}
          id={`event-schema-${event._id}`}
          type="application/ld+json"
        >
          {`
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "${event.title}",
            "startDate": "${new Date(event.startDate).toISOString()}",
            "endDate": "${new Date(event.endDate).toISOString()}",
            "location": {
              "@type": "Place",
              "name": "${event.location}",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Kiambu",
                "addressRegion": "Kiambu County",
                "addressCountry": "KE"
              }
            },
            "image": "${
              event.imageUrl || "https://uhaicentre.church/images/og-image.jpg"
            }",
            "description": "${event.description.replace(/"/g, '\\"')}",
            "organizer": {
              "@type": "Organization",
              "name": "Uhai Centre Church",
              "url": "https://uhaicentre.church"
            }
            ${
              event.registrationRequired
                ? `,"offers": {
              "@type": "Offer",
              "url": "${event.registrationUrl}",
              "price": "0",
              "priceCurrency": "KES",
              "availability": "https://schema.org/InStock"
            }`
                : ""
            }
          }
        `}
        </Script>
      ))}

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Church Events</h1>

        {/* Filter Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 text-sm font-medium ${
                filter === "upcoming"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                filter === "past"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-8">
              <p>Loading events...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 p-4 rounded text-center">
              <p className="text-red-700">{error}</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No events to display.</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 h-64 bg-gray-300"></div>
                  <div className="p-6 md:w-2/3">
                    <h2 className="text-2xl font-bold mb-2">{event.title}</h2>

                    <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
                      <div className="flex items-center">
                        <FaCalendar className="mr-2" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-2" />
                        <span>
                          {formatTime(event.startDate)} -{" "}
                          {formatTime(event.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="mb-6">{event.description}</p>

                    {new Date(event.startDate) > new Date() &&
                      (event.registrationRequired ? (
                        <Link
                          href={event.registrationUrl || "#"}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
                        >
                          Register Now
                        </Link>
                      ) : (
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 inline-block">
                          No Registration Required
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
