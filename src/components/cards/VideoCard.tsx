"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useUIStore } from "@/lib/store";
import { translations, Language } from "@/lib/translations";
import { TAG_LABELS } from "@/components/filters/TagCloud";
import { translateTitle } from "@/lib/auto-tagger";

interface VideoCardProps {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  tags?: string[];
}

export function VideoCard({
  id,
  title,
  duration,
  views,
  thumbnailUrl,
  videoPreviewUrl,
  tags,
}: VideoCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const isVisible = useIntersectionObserver(containerRef, { threshold: 0.6 });

  const { isMuted, setMuted, activeVideoId, setActiveVideoId } = useUIStore();

  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  const translatedTitle = translateTitle(title, activeLang);

  // Single-stream coordinated autoplay: only play if hovered, or if visible and no other active video
  const isPlaying = isHovered || (isVisible && activeVideoId === id);

  // Scroll visibility activation
  useEffect(() => {
    if (isVisible && !isHovered) {
      if (activeVideoId === null) {
        setActiveVideoId(id);
      }
    } else if (!isVisible && activeVideoId === id && !isHovered) {
      setActiveVideoId(null);
    }
  }, [isVisible, isHovered, id, activeVideoId, setActiveVideoId]);

  // Hover activation
  useEffect(() => {
    if (isHovered && activeVideoId !== id) {
      setActiveVideoId(id);
    }
  }, [isHovered, id, activeVideoId, setActiveVideoId]);

  // Real-time watchers fluctuation based on video ID hash (Bandwagon Effect)
  const baseWatchers = (() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 1500) + 450; // between 450 and 1950
  })();

  const [watchers, setWatchers] = useState(baseWatchers);

  useEffect(() => {
    const interval = setInterval(() => {
      setWatchers((prev) => {
         const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.max(100, prev + delta);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => {
        // Silent catch for browser autoplay blocks
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMuted(!isMuted);
  };

  const getTagLabel = (tag: string) => {
    const labels = TAG_LABELS[tag];
    if (labels) return labels[activeLang] || labels.en || tag;
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  const watchUrl = `/video/${id}?lang=${activeLang}`;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsVideoPlaying(false);
      }}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:shadow-xl hover:shadow-rose-500/5 cursor-pointer font-sans"
    >
      <Link
        href={watchUrl}
        className="block relative w-full aspect-video bg-zinc-950 overflow-hidden"
      >
        {/* Poster Image - Fades out only when the video actually starts playing */}
        <Image
          src={thumbnailUrl}
          alt={translatedTitle}
          fill
          unoptimized
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 z-10 group-hover:scale-105 ${
            isVideoPlaying ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Video Loop */}
        {isPlaying && (
          <video
            ref={videoRef}
            src={videoPreviewUrl}
            loop
            playsInline
            muted={isMuted}
            onPlaying={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Active Viewers Overlay (FOMO Indicator) */}
        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-[9px] font-bold text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/10 flex items-center gap-1 z-20">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
          </span>
          <span>
            {watchers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <span className="hidden sm:inline">{t.watching}</span>
          </span>
        </div>

        {/* Duration Overlay */}
        <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-[10px] font-semibold text-white px-2 py-0.5 rounded-md border border-white/5 z-20">
          {duration}
        </span>

        {isPlaying && (
          <button
            onClick={toggleMute}
            className="absolute bottom-2.5 left-2.5 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-lg border border-white/10 transition-all hover:scale-105 active:scale-95 z-20"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
          <div className="bg-rose-500 text-white p-3.5 rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-rose-500/30">
            <Play className="w-5 h-5 fill-white" />
          </div>
        </div>
      </Link>

      {/* Video Details */}
      <div className="p-3 flex flex-col gap-1.5">
        <Link href={watchUrl}>
          <h3 className="text-[11px] sm:text-xs font-semibold text-white line-clamp-2 leading-tight sm:leading-relaxed group-hover:text-rose-500 transition-colors">
            {translatedTitle}
          </h3>
        </Link>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5 z-25 relative">
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${tag}&lang=${activeLang}`}
                className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-muted-foreground border border-white/5 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                #{getTagLabel(tag)}
              </Link>
            ))}
          </div>
        )}

        <span className="text-[10px] text-muted-foreground font-medium">
          {views} {t.views}
        </span>
      </div>
    </div>
  );
}
