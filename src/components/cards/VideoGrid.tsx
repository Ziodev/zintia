"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { VideoCard } from "./VideoCard";
import { NativeAdCard } from "./NativeAdCard";
import { MOCK_VIDEOS, MOCK_ADS } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import posthog from "posthog-js";
import { AFFILIATE_LINKS } from "@/lib/config";

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

  // Roadblock bypass state
  const [isRoadblockBypassed, setIsRoadblockBypassed] = useState(false);

  // Sentinel element for triggering Infinite Scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isSentinelVisible = useIntersectionObserver(sentinelRef, { threshold: 0.1 });

  // Reset pagination limit and roadblock status whenever filters change
  useEffect(() => {
    setLimit(4);
    setIsRoadblockBypassed(false);
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
    if (isSentinelVisible && hasMore && (limit < 16 || isRoadblockBypassed)) {
      setLimit((prev) => prev + 4);
    }
  }, [isSentinelVisible, hasMore, limit, isRoadblockBypassed, setLimit]);

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
        gridItems.push({ type: "ad" as const, data: MOCK_ADS[adIndex] });
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

  const handleRoadblockCTAClick = () => {
    posthog.capture("roadblock_cta_click", {
      language: activeLang,
      target_url: AFFILIATE_LINKS.webcams,
    });
  };

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
              href={AFFILIATE_LINKS.webcams}
              onClick={handleRoadblockCTAClick}
              target="_blank"
              rel="noopener noreferrer"
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
