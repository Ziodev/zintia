"use client";

import { useEffect, useRef } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { VideoCard } from "./VideoCard";
import { NativeAdCard } from "./NativeAdCard";
import { MOCK_VIDEOS, MOCK_ADS } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export function VideoGrid() {
  const [activeCategory] = useQueryState("category", { defaultValue: "all" });
  const [activeSort] = useQueryState("sort", { defaultValue: "latest" });
  const [search] = useQueryState("search", { defaultValue: "" });
  const [lang] = useQueryState("lang", { defaultValue: "es" });

  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // URL-bound pagination limit (defaults to 4 items)
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(4)
  );

  // Sentinel element for triggering Infinite Scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isSentinelVisible = useIntersectionObserver(sentinelRef, { threshold: 0.1 });

  // Reset pagination limit to 4 whenever filters, sorting, or search keywords mutate
  useEffect(() => {
    setLimit(4);
  }, [activeCategory, activeSort, search, setLimit]);

  // 1. Filter by Category
  let filtered = MOCK_VIDEOS;
  if (activeCategory !== "all") {
    filtered = MOCK_VIDEOS.filter((v) => v.category === activeCategory);
  }

  // 2. Filter by Search Query
  if (search) {
    filtered = filtered.filter((v) =>
      v.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 3. Sort Results
  if (activeSort === "views") {
    filtered = [...filtered].sort((a, b) => {
      const aVal = parseFloat(a.views.replace("M", "").replace("K", "")) * (a.views.includes("M") ? 1000000 : 1000);
      const bVal = parseFloat(b.views.replace("M", "").replace("K", "")) * (b.views.includes("M") ? 1000000 : 1000);
      return bVal - aVal;
    });
  }

  const hasMore = filtered.length > limit;

  // Infinite scroll trigger when sentinel becomes visible
  useEffect(() => {
    if (isSentinelVisible && hasMore) {
      setLimit((prev) => prev + 4);
    }
  }, [isSentinelVisible, hasMore, setLimit]);

  if (filtered.length === 0) {
    return (
      <div className="w-full text-center py-16 text-muted-foreground text-sm font-medium">
        No se encontraron videos.
      </div>
    );
  }

  // Slice list up to current pagination limit
  const slicedVideos = filtered.slice(0, limit);

  // Inject Ads and recycle variants (standard, private, interactive)
  const gridItems = [];
  let adCounter = 0;

  for (let i = 0; i < slicedVideos.length; i++) {
    gridItems.push({ type: "video" as const, data: slicedVideos[i] });

    // Inject ads at index 1 (3rd position), index 4 (6th position), index 7 (9th position), etc.
    if (i % 3 === 1) {
      const adIndex = adCounter % MOCK_ADS.length;
      if (MOCK_ADS[adIndex]) {
        gridItems.push({ type: "ad" as const, data: MOCK_ADS[adIndex] });
        adCounter++;
      }
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 py-2">
      {gridItems.map((item, index) => {
        if (item.type === "ad") {
          return (
            <NativeAdCard
              key={`ad-${index}`}
              title={item.data.title}
              ctaText={item.data.ctaText}
              affiliateUrl={item.data.affiliateUrl}
              thumbnailUrl={item.data.thumbnailUrl}
              videoPreviewUrl={item.data.videoPreviewUrl}
              variant={item.data.variant}
            />
          );
        } else {
          return (
            <VideoCard
              key={item.data.id}
              id={item.data.id}
              title={item.data.title}
              duration={item.data.duration}
              views={item.data.views}
              thumbnailUrl={item.data.thumbnailUrl}
              videoPreviewUrl={item.data.videoPreviewUrl}
            />
          );
        }
      })}

      {hasMore && (
        <div ref={sentinelRef} className="col-span-full flex justify-center py-8 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </div>
  );
}
