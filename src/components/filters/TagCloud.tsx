"use client";

import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { Hash, X } from "lucide-react";
import { Video } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import Link from "next/link";
import { useParams } from "next/navigation";

import { TAG_LABELS } from "@/lib/constants";

interface TagCloudProps {
  videos: Video[];
  activeTag?: string;
}

export function TagCloud({ videos, activeTag: propActiveTag }: TagCloudProps) {
  const [queryActiveTag] = useQueryState("tag", {
    defaultValue: "",
    shallow: true,
  });

  const activeTag = propActiveTag !== undefined ? propActiveTag : queryActiveTag;

  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";

  const params = useParams();
  const categoryId = params?.id as string;
  const isCategoryPage = categoryId && ["amateur", "anal", "milf", "caseros", "latinas", "ebony", "webcams"].includes(categoryId);

  const getTagHref = (tag: string, isActive: boolean) => {
    if (isActive) {
      return isCategoryPage 
        ? `/category/${categoryId}?lang=${activeLang}` 
        : `/?lang=${activeLang}`;
    }
    return `/tag/${tag}?lang=${activeLang}`;
  };

  // Calculate tag frequencies from all videos
  const tagCounts = new Map<string, number>();
  for (const video of videos) {
    if (!video.tags) continue;
    for (const tag of video.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  // Sort by frequency descending, take top 30
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  if (sortedTags.length === 0) return null;

  const getLabel = (tag: string) => {
    const labels = TAG_LABELS[tag];
    if (labels) return labels[activeLang] || labels.en || tag;
    // Capitalize first letter for unknown tags
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Hash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tags</span>
        {activeTag && (
          <Link
            href={isCategoryPage ? `/category/${categoryId}?lang=${activeLang}` : `/?lang=${activeLang}`}
            className="ml-auto flex items-center gap-1 text-[10px] font-medium text-rose-400 hover:text-rose-300 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Limpiar</span>
          </Link>
        )}
      </div>
      <div className="flex w-full overflow-x-auto gap-1.5 pb-1 no-scrollbar whitespace-nowrap scroll-smooth flex-nowrap items-center">
        {sortedTags.map(([tag, count]) => {
          const isActive = activeTag === tag;
          return (
            <Link
              key={tag}
              href={getTagHref(tag, isActive)}
              className={cn(
                "whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all duration-200 active:scale-95 flex items-center gap-1",
                isActive
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-sm shadow-rose-500/10"
                  : "bg-zinc-900/60 border-white/5 text-muted-foreground hover:text-white hover:bg-zinc-800 hover:border-white/10"
              )}
            >
              <span>{getLabel(tag)}</span>
              <span className={cn(
                "text-[9px] font-bold",
                isActive ? "text-rose-500/60" : "text-zinc-600"
              )}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
