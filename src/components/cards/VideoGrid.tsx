"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useParams } from "next/navigation";
import { ShieldCheck, ExternalLink, Flame } from "lucide-react";
import Link from "next/link";
import { VideoCard } from "./VideoCard";
import { NativeAdCard } from "./NativeAdCard";
import { MOCK_ADS, Video } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import posthog from "posthog-js";
import { getMobideaLink } from "@/lib/utils";

const ROADBLOCK_COPIES: Record<Language, { title: string; desc: string; button: string; bypass: string }> = {
  es: {
    title: "Verificación de Navegación",
    desc: "Para seguir viendo más contenido gratuito, verifica que eres humano o descubre las modelos en vivo de tu zona.",
    button: "Ver Modelos en Vivo y Continuar",
    bypass: "Continuar Navegación Gratuita",
  },
  en: {
    title: "Navigation Verification",
    desc: "To continue watching free content, please verify you are human or discover the live models in your area.",
    button: "View Live Models & Continue",
    bypass: "Continue Free Browsing",
  },
  fr: {
    title: "Vérification de Navigation",
    desc: "Pour continuer à regarder du contenu gratuit, veuillez vérifier que vous êtes humain ou découvrez les modèles en direct de votre région.",
    button: "Voir les Modèles en Direct",
    bypass: "Continuer la Navigation Gratuite",
  },
  ja: {
    title: "人間確認のお知らせ",
    desc: "無料コンテンツ의 視聴を続けるには、人間であることを確認するか、お住まいの地域のライブモデルをご覧ください。",
    button: "ライブモデルを見て続ける",
    bypass: "無料でブラウジングを続ける",
  },
  it: {
    title: "Verifica di Navigazione",
    desc: "Per continuare a guardare contenuti gratuiti, verifica di essere umano o scopri le modelle dal vivo nella tua zona.",
    button: "Vedi Modelle dal Vivo",
    bypass: "Continua la Navigazione Gratuita",
  },
  pt: {
    title: "Verificação de Navegação",
    desc: "Para continuar a ver conteúdo gratuito, verifique se é humano ou descubra os modelos ao vivo na sua área.",
    button: "Ver Modelos ao Vivo",
    bypass: "Continuar Navegação Gratuita",
  },
};

interface VideoGridProps {
  initialVideos: Video[];
  forcedTag?: string;
}

export function VideoGrid({ initialVideos, forcedTag }: VideoGridProps) {
  const params = useParams();
  const activeCategory = (params?.id as string) || "all";
  const [activeSort] = useQueryState("sort", { defaultValue: "latest", shallow: true });
  const [activeTag] = useQueryState("tag", { defaultValue: "", shallow: true });
  const [search] = useQueryState("search", { defaultValue: "", shallow: true });
  const [lang] = useQueryState("lang", { defaultValue: "es", shallow: true });
  const currentTag = forcedTag || activeTag;

  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // URL-bound pagination limit (defaults to 4 items)
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(4)
  );

  // Roadblock bypass state
  const [isRoadblockBypassed, setIsRoadblockBypassed] = useState(false);

  // Sentinel element for triggering Infinite Scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isSentinelVisible = useIntersectionObserver(sentinelRef, { threshold: 0.1 });

  // Session-based preferences state for personalized recommendations
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [preferredTags, setPreferredTags] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedCats = localStorage.getItem("zintia_preferred_categories");
    const storedTags = localStorage.getItem("zintia_preferred_tags");
    if (storedCats) {
      try {
        setPreferredCategories(JSON.parse(storedCats));
      } catch {}
    }
    if (storedTags) {
      try {
        setPreferredTags(JSON.parse(storedTags));
      } catch {}
    }

    const handleUpdate = () => {
      const updatedCats = localStorage.getItem("zintia_preferred_categories");
      const updatedTags = localStorage.getItem("zintia_preferred_tags");
      setPreferredCategories(updatedCats ? JSON.parse(updatedCats) : []);
      setPreferredTags(updatedTags ? JSON.parse(updatedTags) : []);
    };
    window.addEventListener("zintia_playlist_updated", handleUpdate);
    return () => {
      window.removeEventListener("zintia_playlist_updated", handleUpdate);
    };
  }, []);

  // Reset pagination limit and roadblock status whenever filters change
  useEffect(() => {
    setLimit(4);
    setIsRoadblockBypassed(false);
  }, [activeCategory, activeSort, search, currentTag, setLimit]);

  // 1. Filter by Category
  let filtered = initialVideos;
  if (activeCategory !== "all") {
    filtered = initialVideos.filter((v) => v.category === activeCategory);
  }

  // 1.5 Filter by Tag
  if (currentTag) {
    filtered = filtered.filter((v) => v.tags && v.tags.includes(currentTag));
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
  } else if (activeSort === "recommend" && isClient && (preferredCategories.length > 0 || preferredTags.length > 0)) {
    filtered = [...filtered].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (preferredCategories.includes(a.category)) scoreA += 15;
      if (preferredCategories.includes(b.category)) scoreB += 15;

      if (a.tags) {
        a.tags.forEach((tag) => {
          if (preferredTags.includes(tag)) scoreA += 3;
        });
      }
      if (b.tags) {
        b.tags.forEach((tag) => {
          if (preferredTags.includes(tag)) scoreB += 3;
        });
      }

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return b.id.localeCompare(a.id); // fallback to latest
    });
  } else if (isClient && (preferredCategories.length > 0 || preferredTags.length > 0)) {
    // Personalize default feed on client using preferred categories and tags
    filtered = [...filtered].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Category matches
      if (preferredCategories.includes(a.category)) scoreA += 15;
      if (preferredCategories.includes(b.category)) scoreB += 15;

      // Tag matches
      if (a.tags) {
        a.tags.forEach((tag) => {
          if (preferredTags.includes(tag)) scoreA += 3;
        });
      }
      if (b.tags) {
        b.tags.forEach((tag) => {
          if (preferredTags.includes(tag)) scoreB += 3;
        });
      }

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return 0; // retain original order
    });
  }

  const hasMore = filtered.length > limit;

  // Infinite scroll trigger when sentinel becomes visible
  useEffect(() => {
    if (isSentinelVisible && hasMore) {
      setLimit((prev) => {
        if (prev < 16 || isRoadblockBypassed) {
          return prev + 4;
        }
        return prev;
      });
    }
  }, [isSentinelVisible, hasMore, isRoadblockBypassed, setLimit]);

  // Track Roadblock Impression
  const isRoadblockActive = limit >= 16 && !isRoadblockBypassed;
  useEffect(() => {
    if (isRoadblockActive) {
      posthog.capture("roadblock_impression", {
        language: activeLang,
        limit,
      });
    }
  }, [isRoadblockActive, activeLang, limit]);

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
        // Dynamically assign unique assets from the end of the loaded video list to prevent repetition
        const sourceVideo = filtered[filtered.length - 1 - adCounter] || filtered[0] || { thumbnailUrl: "", videoPreviewUrl: "" };
        gridItems.push({ 
          type: "ad" as const, 
          data: {
            ...MOCK_ADS[adIndex],
            thumbnailUrl: sourceVideo.thumbnailUrl,
            videoPreviewUrl: sourceVideo.videoPreviewUrl,
            variant: MOCK_ADS[adIndex].variant,
          }
        });
        adCounter++;
      }
    }
  }

  const handleBypass = () => {
    posthog.capture("roadblock_bypassed", {
      language: activeLang,
    });
    setIsRoadblockBypassed(true);
  };

  const handleRoadblockCTAClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetUrl = getMobideaLink("roadblock_cta");
    posthog.capture("roadblock_cta_click", {
      language: activeLang,
      target_url: targetUrl,
    });
    window.location.href = targetUrl;
  };

  const showNoPrefsBanner = activeSort === "recommend" && isClient && preferredCategories.length === 0 && preferredTags.length === 0;

  const bannerTranslations = {
    es: {
      title: "🔥 Activa tu Feed Personalizado",
      desc: "Juega a 'Hot or Not' deslizando videos para que nuestro algoritmo aprenda tus gustos y ordene la página a tu medida.",
      btn: "JUGAR AHORA",
    },
    en: {
      title: "🔥 Activate Your Personalized Feed",
      desc: "Play 'Hot or Not' by swiping videos so our algorithm learns your tastes and sorts the page just for you.",
      btn: "PLAY NOW",
    },
    fr: {
      title: "🔥 Activez votre Flux Personnalisé",
      desc: "Jouez à 'Hot or Not' pour que notre algorithme apprenne vos goûts.",
      btn: "JOUER MAINTENANT",
    },
    ja: {
      title: "🔥 あなただけのおすすめフィード",
      desc: "「Hot or Not」ゲームで動画をスワイプし、好みをアルゴリズムに学習させましょう。",
      btn: "今すぐプレイ",
    },
    it: {
      title: "🔥 Attiva il tuo Feed Personalizzato",
      desc: "Gioca a 'Hot or Not' trascinando i video per insegnare all'algoritmo i tuoi gusti.",
      btn: "GIOCA ORA",
    },
    pt: {
      title: "🔥 Ative seu Feed Personalizado",
      desc: "Jogue 'Hot or Not' deslizando vídeos para que nosso algoritmo aprenda seus gostos.",
      btn: "JOGAR AGORA",
    },
  };

  const bt = bannerTranslations[activeLang] || bannerTranslations.es;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-2">
      {showNoPrefsBanner && (
        <div className="col-span-full bg-zinc-900/40 backdrop-blur-md border border-rose-500/20 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center max-w-xl mx-auto my-4 shadow-2xl animate-in fade-in duration-300 w-full">
          <div className="bg-rose-500/10 text-rose-500 p-3.5 rounded-full mb-4 animate-glow">
            <Flame className="w-8 h-8 fill-rose-500" />
          </div>
          <h2 className="text-base font-bold text-white mb-2 font-heading uppercase tracking-wide">
            {bt.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans mb-6">
            {bt.desc}
          </p>
          <Link
            href={`/swipe?lang=${activeLang}`}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl transition-all active:scale-95 shadow-md shadow-rose-500/20 animate-glow cursor-pointer font-heading"
          >
            {bt.btn}
          </Link>
        </div>
      )}
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
              tags={item.data.tags}
              category={item.data.category}
            />
          );
        }
      })}

      {/* Roadblock Scroll Depth Interceptor (At 16 videos, before further loads) */}
      {limit >= 16 && !isRoadblockBypassed ? (
        <div className="col-span-full bg-zinc-900/40 backdrop-blur-lg border border-rose-500/20 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center max-w-xl mx-auto my-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-rose-500/10 text-rose-500 p-3.5 rounded-full mb-4 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-white mb-2 font-heading uppercase tracking-wide">
            {ROADBLOCK_COPIES[activeLang].title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans mb-6">
            {ROADBLOCK_COPIES[activeLang].desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <a
              href="#"
              onClick={handleRoadblockCTAClick}
              className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-rose-500/20 animate-glow cursor-pointer font-heading"
            >
              <span>{ROADBLOCK_COPIES[activeLang].button}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleBypass}
              className="w-full sm:w-auto text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer font-sans font-semibold py-3 px-4 hover:underline"
            >
              {ROADBLOCK_COPIES[activeLang].bypass}
            </button>
          </div>
        </div>
      ) : (
        hasMore && (
          <div ref={sentinelRef} className="col-span-full flex justify-center py-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )
      )}
    </div>
  );
}
