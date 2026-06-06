import type { MetadataRoute } from "next";
import { getVideos } from "@/lib/feed";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com";
const LANGUAGES = ["es", "en", "fr", "ja", "it", "pt"] as const;

export const revalidate = 3600; // Refresh the sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const videos = await getVideos();

  // Homepage entries for each language
  const homeEntries: MetadataRoute.Sitemap = LANGUAGES.map((lang) => ({
    url: lang === "es" ? SITE_URL : `${SITE_URL}/?lang=${lang}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l, l === "es" ? SITE_URL : `${SITE_URL}/?lang=${l}`])
      ),
    },
  }));

  // Video page entries for each video × each language
  const videoEntries: MetadataRoute.Sitemap = videos.flatMap((video) =>
    LANGUAGES.map((lang) => ({
      url:
        lang === "es"
          ? `${SITE_URL}/video/${video.id}`
          : `${SITE_URL}/video/${video.id}?lang=${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          LANGUAGES.map((l) => [
            l,
            l === "es"
              ? `${SITE_URL}/video/${video.id}`
              : `${SITE_URL}/video/${video.id}?lang=${l}`,
          ])
        ),
      },
    }))
  );

  return [...homeEntries, ...videoEntries];
}
