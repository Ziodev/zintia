"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { Play, Volume2, VolumeX } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useUIStore } from "@/lib/store";
import { translations, Language } from "@/lib/translations";

interface VideoCardProps {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnailUrl: string;
  videoPreviewUrl: string;
}

export function VideoCard({
  id,
  title,
  duration,
  views,
  thumbnailUrl,
  videoPreviewUrl,
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

  const isPlaying = isHovered || isVisible;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      if (activeVideoId !== id && isHovered) {
        setActiveVideoId(id);
      }

      video.play().catch((err) => {
        console.warn("Autoplay block:", err);
      });
    } else {
      video.pause();
      if (activeVideoId === id) {
        setActiveVideoId(null);
      }
    }
  }, [isPlaying, id, activeVideoId, setActiveVideoId, isHovered]);

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

  const watchUrl = `/video/${id}?lang=${activeLang}`;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsVideoPlaying(false);
      }}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:shadow-xl hover:shadow-rose-500/5 cursor-pointer"
    >
      <Link href={watchUrl} className="block relative w-full aspect-video bg-zinc-950 overflow-hidden">
        {/* Poster Image - Fades out only when the video actually starts playing */}
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          unoptimized
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10 ${
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

        {/* Overlays */}
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
      <div className="p-3 flex flex-col gap-1">
        <Link href={watchUrl}>
          <h3 className="text-xs font-semibold text-white line-clamp-2 leading-relaxed group-hover:text-rose-500 transition-colors">
            {title}
          </h3>
        </Link>
        <span className="text-[10px] text-muted-foreground font-medium">
          {views} {t.views}
        </span>
      </div>
    </div>
  );
}
