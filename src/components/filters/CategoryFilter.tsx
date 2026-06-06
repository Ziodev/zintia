"use client";

import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";

const CATEGORIES = [
  { id: "all", label: "🔥 Todos" },
  { id: "amateur", label: "Amateur" },
  { id: "anal", label: "Anal" },
  { id: "milf", label: "Maduras" },
  { id: "caseros", label: "Caseros" },
  { id: "latinas", label: "Latinas" },
  { id: "webcams", label: "Webcams" },
];

export function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useQueryState("category", {
    defaultValue: "all",
    shallow: true,
  });

  const [activeSort, setActiveSort] = useQueryState("sort", {
    defaultValue: "latest",
    shallow: true,
  });

  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  const sorts = [
    { id: "latest", label: t.recent },
    { id: "views", label: t.mostViewed },
  ];

  return (
    <div className="w-full flex flex-col gap-4 py-4 border-b border-white/5">
      {/* Categories Horizontal Scroll */}
      <div className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2 pb-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 active:scale-95",
                isActive
                  ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/15"
                  : "bg-secondary border-white/5 text-muted-foreground hover:text-white hover:bg-zinc-800"
              )}
            >
              {cat.label}
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
    </div>
  );
}
