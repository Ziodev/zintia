import { Suspense } from "react";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import { VideoGrid } from "@/components/cards/VideoGrid";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { translations, Language } from "@/lib/translations";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  return (
    <div className="flex flex-col gap-6 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          {t.featuredContent}
          <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-rose-500/20">
            {t.live}
          </span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground font-sans">
          {t.exploreText}
        </p>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <CategoryFilter />
        <VideoGrid />
      </Suspense>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 py-4">
      {/* Scrollbar skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-3.5 w-[85%] rounded" />
            <Skeleton className="h-2.5 w-[50%] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
