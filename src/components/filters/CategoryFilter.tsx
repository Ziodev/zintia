"use client";

import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { Flame, Heart, Target, Sparkles, Home, Globe, Video, Moon } from "lucide-react";
import { TagCloud } from "./TagCloud";
import { Video as VideoType } from "@/lib/data";

const CATEGORIES = [
  { id: "all", translationKey: "cat_all" },
  { id: "amateur", translationKey: "cat_amateur" },
  { id: "anal", translationKey: "cat_anal" },
  { id: "milf", translationKey: "cat_milf" },
  { id: "caseros", translationKey: "cat_caseros" },
  { id: "latinas", translationKey: "cat_latinas" },
  { id: "ebony", translationKey: "cat_ebony" },
  { id: "webcams", translationKey: "cat_webcams" },
] as const;

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  all: Flame,
  amateur: Heart,
  anal: Target,
  milf: Sparkles,
  caseros: Home,
  latinas: Globe,
  ebony: Moon,
  webcams: Video,
};

interface CategoryFilterProps {
  videos: VideoType[];
}

export function CategoryFilter({ videos }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useQueryState("category", {
    defaultValue: "all",
    shallow: true,
  });

  const [activeSort, setActiveSort] = useQueryState("sort", {
    defaultValue: "latest",
    shallow: true,
  });

  const [activeTag, setActiveTag] = useQueryState("tag", {
    defaultValue: "",
    shallow: true,
  });

  const [search] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
  });

  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  const sorts = [
    { id: "latest", label: t.recent },
    { id: "views", label: t.mostViewed },
  ];

  // Filter videos dynamically for the TagCloud based on active category and search
  let filteredVideosForTags = videos;
  if (activeCategory !== "all") {
    filteredVideosForTags = filteredVideosForTags.filter((v) => v.category === activeCategory);
  }
  if (search) {
    filteredVideosForTags = filteredVideosForTags.filter((v) =>
      v.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  const visibleCategories = CATEGORIES.filter((cat) => {
    if (cat.id === "all" || cat.id === "webcams") return true;
    return videos.some((v) => v.category === cat.id);
  });

  return (
    <div id="categories" className="w-full flex flex-col gap-4 py-4 border-b border-white/5 scroll-mt-20">
      {/* Categories Horizontal Scroll */}
      <div className="flex w-full overflow-x-auto gap-2 pb-2 no-scrollbar whitespace-nowrap scroll-smooth flex-nowrap items-center">
        {visibleCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const label = t[cat.translationKey as keyof typeof t] || cat.id;
          const Icon = CATEGORY_ICONS[cat.id];
          return (
            <button
              key={cat.id}
              onClick={async () => {
                const nextCategory = isActive ? "all" : cat.id;
                await setActiveCategory(nextCategory);
                await setActiveTag(""); // Reset tag when category changes
              }}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 active:scale-95 flex items-center gap-1.5",
                isActive
                  ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/15"
                  : "bg-secondary border-white/5 text-muted-foreground hover:text-white hover:bg-zinc-800"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isActive ? "text-white" : "text-rose-500"
                  )}
                />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Sort options */}
      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
        <span className="font-semibold">{t.sortBy}</span>
        <div className="flex items-center gap-1.5">
          {sorts.map((sort) => {
            const isActive = activeSort === sort.id;
            return (
              <button
                key={sort.id}
                onClick={() => setActiveSort(sort.id)}
                className={cn(
                  "px-3 py-1 rounded-lg transition-all duration-200 font-medium",
                  isActive
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : "border border-transparent hover:text-foreground hover:bg-white/5"
                )}
              >
                {sort.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TagCloud */}
      <TagCloud videos={filteredVideosForTags} />
    </div>
  );
}
