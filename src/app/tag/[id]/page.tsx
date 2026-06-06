import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import { VideoGrid } from "@/components/cards/VideoGrid";
import { translations, Language } from "@/lib/translations";
import { getVideos } from "@/lib/feed";
import { notFound } from "next/navigation";
import { TAG_LABELS } from "@/components/filters/TagCloud";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  const getLabel = (tag: string) => {
    const labels = TAG_LABELS[tag];
    if (labels) return labels[activeLang] || labels.en || tag;
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };
  
  const tagName = getLabel(id);

  const titles: Record<Language, string> = {
    es: `Videos de #${tagName} Gratis Online HD | Zintia Vids`,
    en: `Free #${tagName} Videos Online HD | Zintia Vids`,
    fr: `Vidéos de #${tagName} Gratuites en HD | Zintia Vids`,
    ja: `無料 #${tagName} 動画高画質オンライン | Zintia Vids`,
    it: `Video di #${tagName} Gratis Online HD | Zintia Vids`,
    pt: `Vídeos de #${tagName} Grátis Online HD | Zintia Vids`,
  };

  const title = titles[activeLang] || titles.es;
  const description = activeLang === "es"
    ? `Explora los mejores videos gratis con la etiqueta #${tagName} en alta definición. Transmisión fluida y rápida en Zintia Vids.`
    : `Explore the best free videos tagged with #${tagName} in high definition. Fast and smooth streaming on Zintia Vids.`;

  return {
    title,
    description,
    robots: "index, follow",
    alternates: {
      canonical: activeLang === "es" ? `/tag/${id}` : `/tag/${id}?lang=${activeLang}`,
      languages: {
        es: `/tag/${id}?lang=es`,
        en: `/tag/${id}?lang=en`,
        fr: `/tag/${id}?lang=fr`,
        ja: `/tag/${id}?lang=ja`,
        it: `/tag/${id}?lang=it`,
        pt: `/tag/${id}?lang=pt`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  const videos = await getVideos();

  // Validate if tag exists in any video
  const tagExists = videos.some((v) => v.tags && v.tags.includes(id));
  if (!tagExists) {
    notFound();
  }

  const t = translations[activeLang] || translations.es;
  const getLabel = (tag: string) => {
    const labels = TAG_LABELS[tag];
    if (labels) return labels[activeLang] || labels.en || tag;
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };
  const tagName = getLabel(id);

  return (
    <div className="flex flex-col gap-6 py-6 animate-fade-in font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 font-heading">
          {t.categories}: #{tagName}
          <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-rose-500/20 uppercase leading-none">
            Tag
          </span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          {activeLang === "es"
            ? `Explora los mejores videos amateur gratis etiquetados con #${tagName} en alta definición.`
            : `Explore the best free amateur videos tagged with #${tagName} in high definition.`}
        </p>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <CategoryFilter videos={videos} forcedTag={id} />
        <VideoGrid initialVideos={videos} forcedTag={id} />
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
          <div key={i} className="h-8 w-20 rounded-full shrink-0 bg-zinc-900 animate-pulse" />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-video w-full rounded-2xl bg-zinc-900 animate-pulse" />
            <div className="h-3.5 w-[85%] rounded bg-zinc-900 animate-pulse" />
            <div className="h-2.5 w-[50%] rounded bg-zinc-900 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
