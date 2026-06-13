import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import { VideoGrid } from "@/components/cards/VideoGrid";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { translations, Language } from "@/lib/translations";
import { getVideos } from "@/lib/feed";
import { HomeHeader } from "@/components/ui/HomeHeader";
import { CommunityPlaylists } from "@/components/ui/CommunityPlaylists";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  const titles: Record<Language, string> = {
    es: "Zintia Vids - Video Premium Online HD y Webcams en Vivo",
    en: "Zintia Vids - Premium HD Video Online & Live Webcams",
    fr: "Zintia Vids - Vidéo Premium en HD & Webcams en Direct",
    ja: "Zintia Vids - プレミアム高画質動画オンライン＆ライブチャット",
    it: "Zintia Vids - Video Premium Online HD e Webcam dal Vivo",
    pt: "Zintia Vids - Vídeo Premium Online HD e Webcams ao Vivo",
    sl: "Zintia Vids - Premium HD videoposnetki na spletu in spletne kamere v živo",
    da: "Zintia Vids - Premium HD-video online og live webkameraer",
  };

  const descriptions: Record<Language, string> = {
    es: "Disfruta de la mejor experiencia de streaming de video premium en alta definición sin interrupciones y con rendimiento optimizado.",
    en: "Enjoy the best premium video streaming experience in high definition, with zero buffering and optimized performance.",
    fr: "Profitez de la meilleure expérience de streaming vidéo premium en haute définition, sans mise en mémoire tampon et avec des performances optimisées.",
    ja: "バッファリングなしで最適化されたパフォーマンス、高解像度の最高のプレミアム動画ストリーミング体験をお楽しみください。",
    it: "Goditi la migliore esperienza di streaming video premium in alta definizione, con caricamenti istantanei e prestazioni optimizadas.",
    pt: "Desfrute da melhor experiência de streaming de vídeo premium em alta definição, com buffering zero e desempenho otimizado.",
    sl: "Uživajte v najboljši izkušnji pretakanja vrhunskih videoposnetkov v visoki ločljivosti, brez zatikanja in z optimiziranim delovanjem.",
    da: "Nyd den bedste premium videostreamingoplevelse i høj opløsning, helt uden afbrydelser og med optimeret ydeevne.",
  };

  const title = titles[activeLang] || titles.es;
  const description = descriptions[activeLang] || descriptions.es;

  return {
    title,
    description,
    keywords: [
      "videos gratis", "videos porno", "porno en español", "porn tube",
      "free porn", "streaming HD", "video premium", "entretenimiento para adultos",
      "adult videos", "amateur", "webcams en vivo"
    ],
    robots: "index, follow",
    alternates: {
      canonical: activeLang === "es" ? "/" : `/?lang=${activeLang}`,
      languages: {
        es: "/?lang=es",
        en: "/?lang=en",
        fr: "/?lang=fr",
        ja: "/?lang=ja",
        it: "/?lang=it",
        pt: "/?lang=pt",
        sl: "/?lang=sl",
        da: "/?lang=da",
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

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";
  const t = translations[activeLang] || translations.es;
  const videos = await getVideos();

  return (
    <div className="flex flex-col gap-6 py-6 animate-fade-in">
      <HomeHeader
        activeLang={activeLang}
        titleText={t.featuredContent}
        liveLabel={t.live}
        exploreText={t.exploreText}
      />

      <Suspense fallback={<GridSkeleton />}>
        <CategoryFilter videos={videos} />
        <CommunityPlaylists videos={videos} lang={activeLang} />
        <VideoGrid initialVideos={videos} />
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
