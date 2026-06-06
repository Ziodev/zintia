"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { ExternalLink, Play } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { translations, Language } from "@/lib/translations";

interface NativeAdCardProps {
  title: string;
  ctaText: string;
  affiliateUrl: string;
  thumbnailUrl: string;
  videoPreviewUrl: string;
}

export function NativeAdCard({
  title,
  ctaText,
  affiliateUrl,
  thumbnailUrl,
  videoPreviewUrl,
}: NativeAdCardProps) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const isVisible = useIntersectionObserver(containerRef, { threshold: 0.6 });

  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  const isPlaying = isHovered || isVisible;

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

  return (
    <a
      ref={containerRef}
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-rose-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5 cursor-pointer"
    >
      <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden">
        {/* Poster Image */}
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          unoptimized
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isPlaying ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Video Preview Loop */}
        {isPlaying && (
          <video
            ref={videoRef}
            src={videoPreviewUrl}
            loop
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Sponsor Tag */}
        <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
          {t.sponsored}
        </span>

        {/* Call to Action Badge */}
        <span className="absolute bottom-2.5 right-2.5 bg-zinc-900/90 text-[10px] font-bold text-rose-400 px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all font-heading">
          <span>{activeLang === "es" ? ctaText : t.viewModels}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </span>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-rose-500 text-white p-3.5 rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-rose-500/30">
            <Play className="w-5 h-5 fill-white" />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-xs font-semibold text-white line-clamp-2 leading-relaxed group-hover:text-rose-400 transition-colors">
          {title}
        </h3>
        <span className="text-[10px] text-rose-500/80 font-semibold flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
          {t.recommendedOffer}
        </span>
      </div>
    </a>
  );
}
