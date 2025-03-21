// Update app/api/events/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Event from "../../../models/Events";

// Helper function to calculate next occurrence based on recurrence pattern
function getNextOccurrences(event: any, startDate: Date, endDate: Date) {
  if (!event.isRecurring || !event.recurrencePattern) {
    return [event];
  }

  const {
    frequency,
    interval,
    daysOfWeek,
    dayOfMonth,
    monthOfYear,
    endDate: recurrenceEndDate,
    count,
  } = event.recurrencePattern;

  // Make a copy of the event
  const baseEvent = {
    ...event.toObject(),
    _id: event._id.toString(),
  };

  // Calculate event duration in milliseconds
  const durationMs =
    new Date(event.endDate).getTime() - new Date(event.startDate).getTime();

  // Initialize an array to store occurrences
  const occurrences = [];

  // Set the maximum end date (either the provided end date or recurrence end date)
  const maxEndDate =
    recurrenceEndDate && new Date(recurrenceEndDate) < endDate
      ? new Date(recurrenceEndDate)
      : new Date(endDate);

  // Find the first date in the range
  let currentDate = new Date(event.startDate);
  if (currentDate < startDate) {
    // If the event starts before the requested range, find the first occurrence in range
    switch (frequency) {
      case "daily":
        const daysDiff = Math.floor(
          (startDate.getTime() - currentDate.getTime()) / (86400000 * interval)
        );
        currentDate = new Date(
          currentDate.getTime() + daysDiff * 86400000 * interval
        );
        break;
      case "weekly":
        // Skip weeks until we're in the requested range
        while (currentDate < startDate) {
          currentDate = new Date(
            currentDate.getTime() + 7 * 86400000 * interval
          );
        }
        break;
      case "monthly":
        // Skip months until we're in the requested range
        while (currentDate < startDate) {
          const newMonth = currentDate.getMonth() + interval;
          const year = currentDate.getFullYear() + Math.floor(newMonth / 12);
          const month = newMonth % 12;
          currentDate = new Date(year, month, event.startDate.getDate());
        }
        break;
      case "yearly":
        // Skip years until we're in the requested range
        while (currentDate < startDate) {
          currentDate = new Date(
            currentDate.getFullYear() + interval,
            currentDate.getMonth(),
            currentDate.getDate()
          );
        }
        break;
    }
  }

  // Generate occurrences until we reach the end date or count limit
  let occurrenceCount = 0;
  const maxCount = count || Number.MAX_SAFE_INTEGER;

  while (currentDate <= maxEndDate && occurrenceCount < maxCount) {
    // For weekly recurrence, check if the day of week matches
    if (frequency === "weekly" && daysOfWeek && daysOfWeek.length > 0) {
      const dayOfWeek = currentDate.getDay();
      if (!daysOfWeek.includes(dayOfWeek)) {
        // Skip this day and move to the next
        currentDate = new Date(currentDate.getTime() + 86400000);
        continue;
      }
    }

    // For monthly recurrence with specific day of month
    if (frequency === "monthly" && dayOfMonth) {
      const currentDayOfMonth = currentDate.getDate();
      if (currentDayOfMonth !== dayOfMonth) {
        // This isn't the right day of month, so skip
        continue;
      }
    }

    // For yearly recurrence with specific month and day
    if (frequency === "yearly" && monthOfYear !== undefined) {
      const currentMonth = currentDate.getMonth();
      if (currentMonth !== monthOfYear) {
        // This isn't the right month, so skip
        continue;
      }
    }

    // Add this occurrence to our list
    const occurrenceStartDate = new Date(currentDate);
    const occurrenceEndDate = new Date(
      occurrenceStartDate.getTime() + durationMs
    );

    occurrences.push({
      ...baseEvent,
      startDate: occurrenceStartDate,
      endDate: occurrenceEndDate,
      isOccurrence: true,
      originalEventId: event._id.toString(),
    });

    occurrenceCount++;

    // Calculate the next occurrence date
    switch (frequency) {
      case "daily":
        currentDate = new Date(currentDate.getTime() + 86400000 * interval);
        break;
      case "weekly":
        if (daysOfWeek && daysOfWeek.length > 0) {
          // If we have specific days of week, move to the next day
          currentDate = new Date(currentDate.getTime() + 86400000);
        } else {
          // Otherwise, jump to next week
          currentDate = new Date(
            currentDate.getTime() + 7 * 86400000 * interval
          );
        }
        break;
      case "monthly":
        const newMonth = currentDate.getMonth() + interval;
        const year = currentDate.getFullYear() + Math.floor(newMonth / 12);
        const month = newMonth % 12;

        // Handle cases where the day might not exist in some months
        let day = currentDate.getDate();
        let tempDate = new Date(year, month + 1, 0);
        if (day > tempDate.getDate()) {
          day = tempDate.getDate();
        }

        currentDate = new Date(year, month, day);
        break;
      case "yearly":
        currentDate = new Date(
          currentDate.getFullYear() + interval,
          currentDate.getMonth(),
          currentDate.getDate()
        );
        break;
    }
  }

  return occurrences;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    await dbConnect();

    // Create default date range if not provided (next 3 months)
    const startDate = start ? new Date(start) : new Date();
    const endDate = end
      ? new Date(end)
      : new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 3,
          startDate.getDate()
        );

    // Find events that start within the date range or are recurring
    const events = await Event.find({
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { isRecurring: true },
      ],
    }).sort({ startDate: 1 });

    // Generate occurrences for recurring events
    const allEvents = [];

    for (const event of events) {
      if (event.isRecurring) {
        const occurrences = getNextOccurrences(event, startDate, endDate);
        allEvents.push(...occurrences);
      } else {
        // Non-recurring event
        allEvents.push({
          ...event.toObject(),
          _id: event._id.toString(),
        });
      }
    }

    // Sort by start date
    allEvents.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: allEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
