// In app/calendar/page.tsx
"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Link from "next/link";

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  registrationRequired: boolean;
  registrationUrl?: string;
  isOccurrence?: boolean;
  originalEventId?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayEvents, setDayEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Update month and year when current date changes
    setCurrentMonth(currentDate.getMonth());
    setCurrentYear(currentDate.getFullYear());

    // Fetch events for this month
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Calculate first and last day of the month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);

      // Format dates for API
      const startParam = firstDay.toISOString().split("T")[0];
      const endParam = lastDay.toISOString().split("T")[0];

      const response = await fetch(
        `/api/events?start=${startParam}&end=${endParam}`
      );
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);

        // If a day is selected, filter events for that day
        if (selectedDay !== null) {
          filterEventsForDay(selectedDay);
        }
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

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const filterEventsForDay = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const nextDate = new Date(currentYear, currentMonth, day + 1);

    // Filter events that occur on the selected day
    const filteredEvents = events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Check if the event is on this day
      return (
        (eventStart >= selectedDate && eventStart < nextDate) || // Event starts on this day
        (eventEnd >= selectedDate && eventEnd < nextDate) || // Event ends on this day
        (eventStart < selectedDate && eventEnd >= nextDate) // Event spans over this day
      );
    });

    setDayEvents(filteredEvents);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    filterEventsForDay(day);
  };

  const hasEventsOnDay = (day: number) => {
    const dayDate = new Date(currentYear, currentMonth, day);
    const nextDate = new Date(currentYear, currentMonth, day + 1);

    return events.some((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      return (
        (eventStart >= dayDate && eventStart < nextDate) ||
        (eventEnd >= dayDate && eventEnd < nextDate) ||
        (eventStart < dayDate && eventEnd >= nextDate)
      );
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    // Create array of weekday names
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Calculate days from previous month to fill first row
    const daysBefore = firstDayOfMonth;

    // Calculate days from next month to fill last row
    const totalCells = Math.ceil((daysInMonth + daysBefore) / 7) * 7;
    const daysAfter = totalCells - (daysInMonth + daysBefore);

    // Get the day of month for today
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const todayDate = today.getDate();

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7">
          {weekdays.map((day) => (
            <div
              key={day}
              className="p-2 text-center font-medium bg-gray-50 border-b"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Previous month days */}
          {Array.from({ length: daysBefore }).map((_, i) => (
            <div
              key={`prev-${i}`}
              className="p-2 text-center text-gray-400 border min-h-[80px]"
            >
              {getDaysInMonth(currentYear, currentMonth - 1) -
                daysBefore +
                i +
                1}
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = isCurrentMonth && day === todayDate;
            const isSelected = day === selectedDay;
            const hasEvents = hasEventsOnDay(day);

            return (
              <div
                key={`curr-${i}`}
                className={`p-2 border min-h-[80px] ${
                  isSelected
                    ? "bg-blue-50 ring-2 ring-blue-500"
                    : isToday
                    ? "bg-yellow-50"
                    : ""
                } cursor-pointer hover:bg-gray-50`}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between">
                  <span
                    className={`flex items-center justify-center h-6 w-6 rounded-full 
                      ${isToday ? "bg-blue-600 text-white" : ""}
                    `}
                  >
                    {day}
                  </span>
                  {hasEvents && !isSelected && (
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Next month days */}
          {Array.from({ length: daysAfter }).map((_, i) => (
            <div
              key={`next-${i}`}
              className="p-2 text-center text-gray-400 border min-h-[80px]"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Church Calendar</h1>
          <div className="flex items-center">
            <FaCalendarAlt className="text-blue-600 mr-2" />
            <span className="text-gray-600">
              All church events and services
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">{renderCalendar()}</div>

          {/* Selected Day Events */}
          <div>
            {selectedDay && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4">
                  Events on{" "}
                  {new Date(
                    currentYear,
                    currentMonth,
                    selectedDay
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>

                {dayEvents.length === 0 ? (
                  <p className="text-gray-500">
                    No events scheduled for this day.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {dayEvents.map((event) => (
                      <div
                        key={event._id}
                        className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r"
                      >
                        <h3 className="font-bold">{event.title}</h3>
                        <div className="text-sm text-gray-600 space-y-1 mt-2">
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
                        <p className="mt-2 text-sm">
                          {event.description.substring(0, 100)}...
                        </p>
                        {event.registrationRequired && (
                          <div className="mt-2">
                            <a
                              href={event.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Register
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
