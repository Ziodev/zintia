"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Folder, Volume2, VolumeX } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { translations, Language } from "@/lib/translations";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  videoPreviewUrl: string | null;
  lang: Language;
}

export function CategoryCard({
  id,
  name,
  description,
  thumbnailUrl,
  videoPreviewUrl,
  lang,
}: CategoryCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { isMuted, setMuted } = useUIStore();

  const isPlaying = isHovered && videoPreviewUrl;

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

  const targetUrl = `/category/${id}?lang=${lang}`;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsVideoPlaying(false);
      }}
      className="group relative aspect-[16/10] bg-zinc-950 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 cursor-pointer"
    >
      <Link href={targetUrl} className="block w-full h-full relative">
        {/* Poster Image */}
        <Image
          src={thumbnailUrl}
          alt={name}
          fill
          unoptimized
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
            isVideoPlaying ? "opacity-0 scale-110" : "opacity-100"
          }`}
        />

        {/* Video Preview Loop */}
        {isPlaying && videoPreviewUrl && (
          <video
            ref={videoRef}
            src={videoPreviewUrl}
            loop
            playsInline
            muted={isMuted}
            onPlaying={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300"
          />
        )}

        {/* Dark radial vignette to make text highly readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/30 group-hover:via-black/30 group-hover:from-black/95 transition-all duration-500 z-10" />

        {/* Glassmorphic Category Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-20 flex flex-col gap-1 sm:gap-2">
          {/* Header row: Category Icon and Name */}
          <div className="flex items-center gap-2">
            <div className="bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20 group-hover:bg-rose-500 group-hover:border-rose-500 transition-all duration-300">
              <Folder className="w-3.5 h-3.5 text-rose-400 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-rose-400 transition-colors uppercase font-heading">
              {name}
            </h2>
          </div>

          {/* Description */}
          <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed opacity-85 group-hover:opacity-100 transition-opacity duration-300 font-sans">
            {description}
          </p>

          {/* Action indicator */}
          <div className="text-[9px] font-bold text-rose-500 tracking-wider uppercase flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {lang === "es" ? "Explorar Categoría →" : lang === "ja" ? "カテゴリーを探索 →" : "Explore Category →"}
          </div>
        </div>

        {/* Mute Button Overlay (when video is active) */}
        {isPlaying && videoPreviewUrl && (
          <button
            onClick={toggleMute}
            className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/90 text-white p-1.5 rounded-lg border border-white/10 transition-all hover:scale-105 active:scale-95 z-30"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </Link>
    </div>
  );
}
