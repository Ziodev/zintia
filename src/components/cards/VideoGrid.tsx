"use client";

import { useEffect } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { VideoCard } from "./VideoCard";
import { NativeAdCard } from "./NativeAdCard";
import { MOCK_VIDEOS, MOCK_ADS } from "@/lib/data";
import { translations, Language } from "@/lib/translations";

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

  if (filtered.length === 0) {
    return (
      <div className="w-full text-center py-16 text-muted-foreground text-sm font-medium">
        No se encontraron videos.
      </div>
    );
  }

  // Slice list up to current pagination limit
  const slicedVideos = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  // Inject Ads
  const gridItems = [];
  let adCounter = 0;

  for (let i = 0; i < slicedVideos.length; i++) {
    gridItems.push({ type: "video" as const, data: slicedVideos[i] });
    
    // Inject native ad card at index 2 (3rd card)
    if (i === 1 && MOCK_ADS[adCounter]) {
      gridItems.push({ type: "ad" as const, data: MOCK_ADS[adCounter] });
      adCounter++;
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
        <div className="col-span-full flex justify-center py-6 mt-4">
          <button
            onClick={() => setLimit((prev) => prev + 4)}
            className="bg-secondary hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-white font-heading text-xs font-bold px-6 py-3 rounded-full transition-all active:scale-95 shadow-md hover:shadow-rose-500/5 cursor-pointer"
          >
            {t.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
