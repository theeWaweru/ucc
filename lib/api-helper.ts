// lib/api-helper.ts
// Utility functions for making API requests with proper error handling

/**
 * Safely fetch JSON data from an API endpoint with error handling
 * @param url The API endpoint URL
 * @param options Fetch options
 * @returns The parsed JSON response
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    // Check if response is OK
    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = "";
      try {
        // Try to parse as JSON first
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorJson = await response.json();
          errorDetails =
            errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } else {
          // If not JSON, get text
          errorDetails = await response.text();
          // If it's HTML, extract just a meaningful part
          if (errorDetails.includes("<!DOCTYPE")) {
            errorDetails = "Server returned HTML instead of JSON";
          }
        }
      } catch (parseError) {
        errorDetails = "Error parsing error response";
      }

      // Throw formatted error
      throw new Error(`API error (${response.status}): ${errorDetails}`);
    }

    // Check if the response is empty
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return {} as T;
    }

    // Parse JSON safely
    try {
      const data = await response.json();
      return data as T;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse API response as JSON");
    }
  } catch (error) {
    // Re-throw fetch errors (like network issues)
    if (error instanceof Error) {
      console.error("API request failed:", error.message);
      throw error;
    }

    // Unknown errors
    console.error("Unknown API error:", error);
    throw new Error("Unknown API error occurred");
  }
}

/**
 * Get latest sermons with pagination
 * @param page Page number (default: 1)
 * @param limit Items per page (default: 10)
 * @param category Optional category filter
 */
export async function getSermons(page = 1, limit = 10, category?: string) {
  let url = `/api/sermons?page=${page}&limit=${limit}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }

  return fetchWithErrorHandling(url);
}

/**
 * Get latest YouTube videos
 * @param count Number of videos to fetch
 */
export async function getLatestVideos(count = 10) {
  return fetchWithErrorHandling(`/api/youtube/latest?count=${count}`);
}

/**
 * Get live stream status
 */
export async function getLiveStreamStatus() {
  return fetchWithErrorHandling("/api/youtube/live");
}
