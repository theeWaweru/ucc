"use client";

/**
 * Track page view
 */
export function trackPageView(path: string = window.location.pathname) {
  // Don't track in development
  if (process.env.NODE_ENV === "development") return;

  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "pageview",
        path,
        referrer: document.referrer,
      }),
      // Use keepalive to ensure the request is sent even if the page is unloaded
      keepalive: true,
    });
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
}

/**
 * Track event
 */
export function trackEvent(
  eventName: string,
  eventCategory: string,
  eventLabel?: string,
  eventValue?: number
) {
  // Don't track in development
  if (process.env.NODE_ENV === "development") return;

  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "event",
        eventName,
        eventCategory,
        eventLabel,
        eventValue,
        path: window.location.pathname,
      }),
      // Use keepalive to ensure the request is sent even if the page is unloaded
      keepalive: true,
    });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}
