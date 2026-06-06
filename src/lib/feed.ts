import { Video } from "./data";
import { DRTUBER_FALLBACK_VIDEOS } from "./drtuber_fallback";
import { prisma } from "./prisma";

/**
 * Retrieves the latest 200 published videos from the database.
 * Falls back to static videos if the database query fails or returns no records.
 */
export async function getVideos(): Promise<Video[]> {
  try {
    const dbVideos = await prisma.video.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { published_at: "desc" },
      take: 200,
    });

    if (dbVideos.length === 0) {
      console.warn("No published videos found in database. Using static fallback.");
      return DRTUBER_FALLBACK_VIDEOS;
    }

    return dbVideos.map((v) => ({
      id: v.id,
      title: v.title,
      duration: v.duration,
      views: v.views,
      category: v.category,
      tags: v.tags,
      thumbnailUrl: v.thumbnailUrl,
      videoPreviewUrl: v.videoPreviewUrl,
      embedUrl: v.embedUrl || undefined,
    }));
  } catch (err) {
    console.error("Database query in getVideos failed, using static fallback:", err);
    return DRTUBER_FALLBACK_VIDEOS;
  }
}

/**
 * Retrieves a single published video by its ID.
 * Falls back to searching in static videos if database fails or record is not found.
 */
export async function getVideoById(id: string): Promise<Video | null> {
  try {
    const video = await prisma.video.findUnique({
      where: { id },
    });

    // Only return if it exists and is published
    if (video && video.status === "PUBLISHED") {
      return {
        id: video.id,
        title: video.title,
        duration: video.duration,
        views: video.views,
        category: video.category,
        tags: video.tags,
        thumbnailUrl: video.thumbnailUrl,
        videoPreviewUrl: video.videoPreviewUrl,
        embedUrl: video.embedUrl || undefined,
      };
    }
    
    // Check fallback if not found in database (e.g. static content)
    const fallbackVideo = DRTUBER_FALLBACK_VIDEOS.find((v) => v.id === id);
    return fallbackVideo || null;
  } catch (err) {
    console.error(`Failed to get video ${id} from database, searching fallback:`, err);
    const fallbackVideo = DRTUBER_FALLBACK_VIDEOS.find((v) => v.id === id);
    return fallbackVideo || null;
  }
}

