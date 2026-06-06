"use client";

import { useQueryState } from "nuqs";
import { VideoCard } from "./VideoCard";
import { NativeAdCard } from "./NativeAdCard";
import { MOCK_VIDEOS, MOCK_ADS } from "@/lib/data";

export function VideoGrid() {
  const [activeCategory] = useQueryState("category", { defaultValue: "all" });
  const [activeSort] = useQueryState("sort", { defaultValue: "latest" });

  let filtered = MOCK_VIDEOS;
  if (activeCategory !== "all") {
    filtered = MOCK_VIDEOS.filter((v) => v.category === activeCategory);
  }

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
        No se encontraron videos en esta categoría.
      </div>
    );
  }

  const gridItems = [];
  let adCounter = 0;

  for (let i = 0; i < filtered.length; i++) {
    gridItems.push({ type: "video" as const, data: filtered[i] });
    
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
    </div>
  );
}
