"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { ExternalLink, Play, Eye, Lock } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { translations, Language } from "@/lib/translations";
import posthog from "posthog-js";
import { AFFILIATE_LINKS } from "@/lib/config";

interface NativeAdCardProps {
  title: string;
  ctaText: string;
  affiliateUrl: string;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  variant?: "standard" | "private" | "interactive";
}

const PRIVATE_LABELS: Record<Language, { title: string; cta: string }> = {
  es: { title: "VIDEO PRIVADO FILTRADO", cta: "Toca para desbloquear gratis" },
  en: { title: "FILTERED PRIVATE VIDEO", cta: "Tap to unlock for free" },
  fr: { title: "VIDÉO PRIVÉE FILTRÉE", cta: "Appuyez pour déverrouiller" },
  ja: { title: "限定公開のプライベート動画", cta: "タップして無料でロック解除" },
  it: { title: "VIDEO PRIVATO FILTRATO", cta: "Tocca per sbloccare gratis" },
  pt: { title: "VÍDEO PRIVADO FILTRADO", cta: "Toque para desbloquear grátis" },
};

const INTERACTIVE_LABELS: Record<Language, { question: string; like: string; pass: string }> = {
  es: { question: "¿Chatear en privado ahora?", like: "❤️ Conectar", pass: "❌ Pasar" },
  en: { question: "Chat in private now?", like: "❤️ Connect", pass: "❌ Pass" },
  fr: { question: "Chatter en privé maintenant?", like: "❤️ Connecter", pass: "❌ Passer" },
  ja: { question: "今すぐプライベートチャット？", like: "❤️ 接続する", pass: "❌ スキップ" },
  it: { question: "Chattare in privato ora?", like: "❤️ Connetti", pass: "❌ Passa" },
  pt: { question: "Chat privado agora?", like: "❤️ Conectar", pass: "❌ Pasar" },
};

export function NativeAdCard({
  title,
  ctaText,
  thumbnailUrl,
  videoPreviewUrl,
  variant = "standard",
}: NativeAdCardProps) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const isVisible = useIntersectionObserver(containerRef, { threshold: 0.6 });

  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // Don't play preview videos for private locked ads (saves bandwidth)
  const isPlaying = (isHovered || isVisible) && variant !== "private";

  // Fluctuating viewers count for standard ads
  const [viewersCount, setViewersCount] = useState(2438);

  useEffect(() => {
    if (variant !== "standard") return;
    const initialViewers = Math.floor(Math.random() * 600) + 2000;
    setViewersCount(initialViewers);

    const interval = setInterval(() => {
      setViewersCount((prev) => {
        const delta = Math.floor(Math.random() * 15) - 7;
        return prev + delta;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [variant]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => {
        console.warn("Ad preview autoplay block:", err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Resolve affiliate link from central config
  const getAffiliateUrl = () => {
    switch (variant) {
      case "private":
        return AFFILIATE_LINKS.private;
      case "interactive":
        return AFFILIATE_LINKS.dating;
      case "standard":
      default:
        return AFFILIATE_LINKS.webcams;
    }
  };

  const activeUrl = getAffiliateUrl();

  const handleCardClick = () => {
    posthog.capture("ad_card_click", {
      variant,
      language: activeLang,
      target_url: activeUrl,
      element: "card_body",
    });
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    posthog.capture("ad_card_click", {
      variant: "interactive",
      language: activeLang,
      target_url: activeUrl,
      element: "like_button",
    });
  };

  const handlePassClick = (e: React.MouseEvent) => {
    posthog.capture("ad_card_click", {
      variant: "interactive",
      language: activeLang,
      target_url: activeUrl,
      element: "pass_button",
    });
  };

  return (
    <a
      ref={containerRef}
      href={activeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsVideoPlaying(false);
      }}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-rose-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5 cursor-pointer"
    >
      <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden">
        {/* Poster Image */}
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          unoptimized
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 z-10 group-hover:scale-105 ${
            isVideoPlaying ? "opacity-0" : "opacity-100"
          } ${variant === "private" ? "blur-xl scale-[1.08]" : ""}`}
        />

        {/* Video Preview Loop */}
        {isPlaying && (
          <video
            ref={videoRef}
            src={videoPreviewUrl}
            loop
            playsInline
            muted
            onPlaying={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Private / Locked Lock Overlay */}
        {variant === "private" && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-rose-500 text-white p-3 rounded-full shadow-lg shadow-rose-500/20 mb-2 animate-pulse">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider leading-none mb-1">
              {PRIVATE_LABELS[activeLang].title}
            </span>
            <span className="text-xs font-bold text-white leading-tight">
              {PRIVATE_LABELS[activeLang].cta}
            </span>
          </div>
        )}

        {/* Sponsor Tag */}
        <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider z-20">
          {t.sponsored}
        </span>

        {/* Call to Action Badge (Hidden on Mobile to avoid overlay occlusion) */}
        {variant !== "interactive" && variant !== "private" && (
          <span className="absolute bottom-2.5 right-2.5 bg-zinc-900/90 text-[10px] font-bold text-rose-400 px-2.5 py-1 rounded-lg border border-rose-500/20 hidden sm:flex items-center gap-1 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all font-heading z-20 animate-glow">
            <span>{activeLang === "es" ? ctaText : t.viewModels}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </span>
        )}

        {/* Play Icon Overlay */}
        {variant !== "private" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
            <div className="bg-rose-500 text-white p-3.5 rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-rose-500/30">
              <Play className="w-5 h-5 fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col gap-1 justify-between flex-grow">
        <h3 className="text-[11px] sm:text-xs font-semibold text-white line-clamp-2 leading-tight sm:leading-relaxed group-hover:text-rose-400 transition-colors">
          {variant === "private"
            ? `${PRIVATE_LABELS[activeLang].title} [${activeLang === "es" ? "EXCLUSIVO" : "EXCLUSIVE"}]`
            : variant === "interactive"
            ? INTERACTIVE_LABELS[activeLang].question
            : t.adTitle || title}
        </h3>
        
        {variant !== "interactive" ? (
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-rose-500/80 font-semibold flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
              {t.recommendedOffer}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 shrink-0">
              {variant === "private" ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">{activeLang === "es" ? "Privado" : "Private"}</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-muted-foreground/75 shrink-0" />
                  <span>{viewersCount.toLocaleString()} <span className="hidden sm:inline">{t.watching}</span></span>
                </>
              )}
              {/* Subtle interactive arrow on mobile */}
              <span className="sm:hidden text-rose-500 ml-1 font-bold">→</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-2 w-full">
            <div
              onClick={handleLikeClick}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] py-2 rounded-xl text-center shadow-md shadow-rose-500/10 transition-all active:scale-95 cursor-pointer"
            >
              {INTERACTIVE_LABELS[activeLang].like}
            </div>
            <div
              onClick={handlePassClick}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-muted-foreground hover:text-white font-semibold text-[10px] py-2 rounded-xl text-center transition-all active:scale-95 cursor-pointer"
            >
              {INTERACTIVE_LABELS[activeLang].pass}
            </div>
          </div>
        )}
      </div>
    </a>
  );
}
