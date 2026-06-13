import type { MetadataRoute } from "next";
import { getVideos } from "@/lib/feed";
import { translateTitle } from "@/lib/auto-tagger";
import { slugify } from "@/lib/utils";
import { TAG_LABELS } from "@/lib/constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com";
const LANGUAGES = ["es", "en", "fr", "ja", "it", "pt", "sl", "da"] as const;
const VALID_CATEGORIES = ["amateur", "anal", "milf", "caseros", "latinas", "ebony", "webcams"] as const;

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

  // Category page entries for each category × each language
  const categoryEntries: MetadataRoute.Sitemap = VALID_CATEGORIES.flatMap((cat) =>
    LANGUAGES.map((lang) => ({
      url:
        lang === "es"
          ? `${SITE_URL}/category/${cat}`
          : `${SITE_URL}/category/${cat}?lang=${lang}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          LANGUAGES.map((l) => [
            l,
            l === "es"
              ? `${SITE_URL}/category/${cat}`
              : `${SITE_URL}/category/${cat}?lang=${l}`,
          ])
        ),
      },
    }))
  );

  const TAGS = Object.keys(TAG_LABELS);
  
  // Tag page entries for each tag × each language
  const tagEntries: MetadataRoute.Sitemap = TAGS.flatMap((tag) =>
    LANGUAGES.map((lang) => ({
      url:
        lang === "es"
          ? `${SITE_URL}/tag/${tag}`
          : `${SITE_URL}/tag/${tag}?lang=${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
      alternates: {
        languages: Object.fromEntries(
          LANGUAGES.map((l) => [
            l,
            l === "es"
              ? `${SITE_URL}/tag/${tag}`
              : `${SITE_URL}/tag/${tag}?lang=${l}`,
          ])
        ),
      },
    }))
  );

  // Programmatic SEO: Cross Category + Tag Combinations
  const categoryTagCombinations = new Set<string>();
  videos.forEach((video) => {
    if (VALID_CATEGORIES.includes(video.category as any) && video.tags && Array.isArray(video.tags)) {
      video.tags.forEach((tag) => {
        if (TAGS.includes(tag)) {
          categoryTagCombinations.add(`${video.category}/${tag}`);
        }
      });
    }
  });

  const categoryTagEntries: MetadataRoute.Sitemap = Array.from(categoryTagCombinations).flatMap((combo) =>
    LANGUAGES.map((lang) => ({
      url:
        lang === "es"
          ? `${SITE_URL}/category/${combo}`
          : `${SITE_URL}/category/${combo}?lang=${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
      alternates: {
        languages: Object.fromEntries(
          LANGUAGES.map((l) => [
            l,
            l === "es"
              ? `${SITE_URL}/category/${combo}`
              : `${SITE_URL}/category/${combo}?lang=${l}`,
          ])
        ),
      },
    }))
  );

  // Video page entries for each video × each language
  const videoEntries: MetadataRoute.Sitemap = videos.flatMap((video) =>
    LANGUAGES.map((lang) => {
      const slug = slugify(translateTitle(video.title, lang));
      const watchPath = `/video/${slug}-${video.id}`;
      return {
        url: lang === "es" ? `${SITE_URL}${watchPath}` : `${SITE_URL}${watchPath}?lang=${lang}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            LANGUAGES.map((l) => {
              const localSlug = slugify(translateTitle(video.title, l));
              const localPath = `/video/${localSlug}-${video.id}`;
              return [l, l === "es" ? `${SITE_URL}${localPath}` : `${SITE_URL}${localPath}?lang=${l}`];
            })
          ),
        },
      };
    })
  );

  return [...homeEntries, ...categoryEntries, ...tagEntries, ...categoryTagEntries, ...videoEntries];
}
