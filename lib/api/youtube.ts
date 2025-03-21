import axios from "axios";
import dbConnect from "../db/connect";
import mongoose from "mongoose";

// Use environment variables for YouTube API
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

// Check if YouTube API is configured
if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
  console.warn(
    "YouTube API not properly configured. Please set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID environment variables."
  );
}

// Sermon model reference
const Sermon =
  mongoose.models.Sermon ||
  mongoose.model("Sermon", new mongoose.Schema({}, { strict: false }));

// Create YouTube API client
const youtube = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  params: {
    key: YOUTUBE_API_KEY,
  },
});

// Function to determine the sermon category and speaker from title/description
function parseSermonDetails(title: string, description: string) {
  // Default values
  let category = "sermon";
  let speaker = "Pastor";

  // Try to extract speaker name - common format is "Speaker Name - Sermon Title"
  const speakerMatch = title.match(/^([^-]+)-/);
  if (speakerMatch && speakerMatch[1].trim()) {
    speaker = speakerMatch[1].trim();
  }

  // Try to determine category based on keywords
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();

  if (
    lowerTitle.includes("sunday service") ||
    lowerDesc.includes("sunday service")
  ) {
    category = "sunday-service";
  } else if (
    lowerTitle.includes("bible study") ||
    lowerDesc.includes("bible study")
  ) {
    category = "bible-study";
  } else if (
    lowerTitle.includes("prayer") ||
    lowerDesc.includes("prayer meeting")
  ) {
    category = "prayer";
  } else if (lowerTitle.includes("youth") || lowerDesc.includes("youth")) {
    category = "youth";
  } else if (
    lowerTitle.includes("testimony") ||
    lowerDesc.includes("testimony")
  ) {
    category = "testimony";
  } else if (lowerTitle.includes("worship") || lowerDesc.includes("worship")) {
    category = "worship";
  }

  return { category, speaker };
}

/**
 * Get the latest videos from the church's YouTube channel
 * @param maxResults Maximum number of results to return
 * @returns Array of video objects
 */
export async function getLatestVideos(maxResults = 50) {
  try {
    const response = await youtube.get("/search", {
      params: {
        part: "snippet",
        channelId: YOUTUBE_CHANNEL_ID,
        maxResults,
        order: "date",
        type: "video",
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.high.url,
    }));
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    throw error;
  }
}

/**
 * Get live streams from the church's YouTube channel
 * @returns Array of live stream objects
 */
export async function getLiveStreams() {
  try {
    const response = await youtube.get("/search", {
      params: {
        part: "snippet",
        channelId: YOUTUBE_CHANNEL_ID,
        eventType: "live",
        type: "video",
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.high.url,
    }));
  } catch (error) {
    console.error("Error fetching live streams:", error);
    throw error;
  }
}

/**
 * Get upcoming live streams from the church's YouTube channel
 * @returns Array of upcoming live stream objects
 */
export async function getUpcomingLiveStreams() {
  try {
    const response = await youtube.get("/search", {
      params: {
        part: "snippet",
        channelId: YOUTUBE_CHANNEL_ID,
        eventType: "upcoming",
        type: "video",
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.high.url,
    }));
  } catch (error) {
    console.error("Error fetching upcoming live streams:", error);
    throw error;
  }
}

/**
 * Get detailed information about a specific video
 * @param id YouTube video ID
 * @returns Detailed video object
 */
export async function getVideoDetails(id: string) {
  try {
    const response = await youtube.get("/videos", {
      params: {
        part: "snippet,contentDetails,statistics,liveStreamingDetails",
        id: id,
      },
    });

    if (response.data.items.length === 0) {
      throw new Error(`Video with ID ${id} not found`);
    }

    const video = response.data.items[0];
    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.high.url,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      isLivestream: !!video.liveStreamingDetails,
      actualStartTime: video.liveStreamingDetails?.actualStartTime,
      scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime,
      concurrentViewers: video.liveStreamingDetails?.concurrentViewers,
    };
  } catch (error) {
    console.error(`Error fetching video details for ${id}:`, error);
    throw error;
  }
}

/**
 * Sync videos from YouTube to the database
 * @returns Summary of sync operation
 */
export async function syncYouTubeVideos() {
  await dbConnect();

  try {
    // Get live streams
    const liveStreams = await getLiveStreams();

    // Get upcoming live streams
    const upcomingStreams = await getUpcomingLiveStreams();

    // Get latest videos (excluding live and upcoming)
    const latestVideos = await getLatestVideos(50);

    // Combine all videos with appropriate flags
    const allVideos = [
      ...liveStreams.map((video) => ({
        ...video,
        isLivestream: true,
        isUpcoming: false,
      })),
      ...upcomingStreams.map((video) => ({
        ...video,
        isLivestream: false,
        isUpcoming: true,
      })),
      ...latestVideos
        .filter(
          (video) =>
            !liveStreams.some((liveVideo) => liveVideo.id === video.id) &&
            !upcomingStreams.some(
              (upcomingVideo) => upcomingVideo.id === video.id
            )
        )
        .map((video) => ({
          ...video,
          isLivestream: false,
          isUpcoming: false,
        })),
    ];

    // Update or create sermons in the database
    let newCount = 0;
    let updatedCount = 0;

    for (const video of allVideos) {
      // Parse title and description to get category and speaker
      const { category, speaker } = parseSermonDetails(
        video.title,
        video.description
      );

      try {
        const existingSermon = await Sermon.findOne({ id: video.id });

        if (existingSermon) {
          // Update existing sermon
          await Sermon.findByIdAndUpdate(existingSermon._id, {
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            publishedDate: new Date(video.publishedAt),
            isLivestream: video.isLivestream,
            isUpcoming: video.isUpcoming,
            category,
            speaker,
            tags: [category],
          });
          updatedCount++;
        } else {
          // Create new sermon
          await Sermon.create({
            title: video.title,
            description: video.description,
            id: video.id,
            thumbnailUrl: video.thumbnailUrl,
            publishedDate: new Date(video.publishedAt),
            isLivestream: video.isLivestream,
            isUpcoming: video.isUpcoming,
            category,
            speaker,
            tags: [category],
            featured: false,
          });
          newCount++;
        }
      } catch (err) {
        console.error(`Error processing video ${video.id}:`, err);
      }
    }

    return {
      success: true,
      message: `Sync complete. Added ${newCount} new videos and updated ${updatedCount} existing videos.`,
      newCount,
      updatedCount,
    };
  } catch (error) {
    console.error("Error syncing YouTube videos:", error);
    return {
      success: false,
      message: `Error syncing YouTube videos: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Get the current live stream if any
 * @returns Live stream object or null
 */
export async function getCurrentLiveStream() {
  try {
    const liveStreams = await getLiveStreams();
    return liveStreams.length > 0 ? liveStreams[0] : null;
  } catch (error) {
    console.error("Error getting current live stream:", error);
    throw error;
  }
}

/**
 * Get the next scheduled service
 * @returns Upcoming service object or null
 */
export async function getNextScheduledService() {
  try {
    const upcomingStreams = await getUpcomingLiveStreams();
    return upcomingStreams.length > 0 ? upcomingStreams[0] : null;
  } catch (error) {
    console.error("Error getting next scheduled service:", error);
    throw error;
  }
}
