"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, X, ExternalLink, Maximize, Minimize } from "lucide-react";
import { Video } from "@/lib/data";
import { Language, translations } from "@/lib/translations";
import { translateTitle } from "@/lib/auto-tagger";

interface VideoPlayerWrapperProps {
  embedUrl: string | null;
  videoPreviewUrl: string;
  thumbnailUrl: string;
  nextVideo: Video;
  nextVideoUrl?: string;
  lang: Language;
}

export function VideoPlayerWrapper({
  embedUrl,
  videoPreviewUrl,
  thumbnailUrl,
  nextVideo,
  nextVideoUrl,
  lang,
}: VideoPlayerWrapperProps) {
  const [showAutoplayOverlay, setShowAutoplayOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const t = translations[lang] || translations.es;
  const nextUrl = nextVideoUrl || `/video/${nextVideo.id}?lang=${lang}`;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle native video ended event
  const handleVideoEnded = () => {
    setShowAutoplayOverlay(true);
    setCountdown(5);
  };

  useEffect(() => {
    if (!showAutoplayOverlay) return;

    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Redirect to next video
      window.location.href = nextUrl;
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showAutoplayOverlay, countdown, nextUrl]);

  const cancelAutoplay = () => {
    setShowAutoplayOverlay(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const nextTitle = translateTitle(nextVideo.title, lang);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-white/5 shadow-2xl group/player fullscreen:rounded-none fullscreen:aspect-auto fullscreen:w-full fullscreen:h-full"
    >
      {embedUrl ? (
        <>
          {/* Native Loading Spinner behind the iframe */}
          {!isIframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
            </div>
          )}
          <iframe
            src={embedUrl}
            onLoad={() => setIsIframeLoaded(true)}
            allowFullScreen
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="relative w-full h-full border-0 z-10 bg-transparent"
            loading="lazy"
          />

          {/* Custom Fullscreen Button (Always visible on mobile, visible on hover on desktop) */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 z-25 p-2 bg-black/60 hover:bg-black/80 backdrop-blur border border-white/10 rounded-full text-white transition-all cursor-pointer md:opacity-0 md:group-hover/player:opacity-100 flex items-center gap-1.5 text-xs font-bold font-sans"
            title="Pantalla Completa"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4 text-rose-500" />
                <span className="pr-1">{lang === "es" ? "Salir" : "Exit"}</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 text-rose-500" />
                <span className="pr-1">{lang === "es" ? "Pantalla Completa" : "Fullscreen"}</span>
              </>
            )}
          </button>

          {/* Floating Next Video Recommendation for Iframe (Since ended event is blocked) */}
          <div className="hidden sm:block absolute bottom-4 right-4 z-20 max-w-[200px] sm:max-w-[240px] bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-2xl opacity-0 translate-y-2 group-hover/player:opacity-100 group-hover/player:translate-y-0 transition-all duration-300 pointer-events-none group-hover/player:pointer-events-auto">
            <span className="text-[8px] sm:text-[9px] font-bold text-rose-500 uppercase tracking-widest block mb-1">
              {lang === "es" ? "Siguiente Video" : lang === "ja" ? "次の動画" : "Next Video"}
            </span>
            <Link 
              href={nextUrl}
              className="flex items-start gap-2 group/next"
            >
              <div className="relative w-14 sm:w-16 aspect-video bg-zinc-900 rounded overflow-hidden shrink-0 border border-white/5">
                <Image
                  src={nextVideo.thumbnailUrl}
                  alt={nextTitle}
                  fill
                  unoptimized
                  className="object-cover group-hover/next:scale-105 transition-all duration-300"
                />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-semibold text-white leading-tight line-clamp-2 group-hover/next:text-rose-400 transition-colors">
                  {nextTitle}
                </span>
                <span className="text-[8px] text-muted-foreground font-medium">
                  {nextVideo.duration}
                </span>
              </div>
            </Link>
          </div>
        </>
      ) : (
        <video
          src={videoPreviewUrl}
          poster={thumbnailUrl}
          controls
          autoPlay
          playsInline
          onEnded={handleVideoEnded}
          className="w-full h-full object-cover"
        />
      )}

      {/* Fullscreen Autoplay Countdown Overlay */}
      {showAutoplayOverlay && (
        <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          {/* Close button to cancel autoplay */}
          <button
            onClick={cancelAutoplay}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer"
            aria-label="Cancelar autoplay"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Countdown Display */}
          <div className="relative w-20 h-20 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                className="stroke-white/10 fill-none"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                className="stroke-rose-500 fill-none transition-all duration-1000 ease-linear"
                strokeWidth="4"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * countdown) / 5}
              />
            </svg>
            <span className="absolute text-2xl font-black text-white">{countdown}</span>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500 mb-2">
            {lang === "es" ? "Comenzando Siguiente Video" : lang === "ja" ? "次の動画を開始します" : "Starting Next Video"}
          </span>

          {/* Next Video Info Card */}
          <div className="w-full max-w-sm bg-zinc-900 border border-white/5 rounded-2xl p-4 flex gap-3 text-left mb-6 shadow-xl">
            <div className="relative w-28 aspect-video bg-zinc-950 rounded-xl overflow-hidden shrink-0 border border-white/5">
              <Image
                src={nextVideo.thumbnailUrl}
                alt={nextTitle}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0 justify-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {nextVideo.category}
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight line-clamp-2">
                {nextTitle}
              </h4>
              <span className="text-[10px] text-muted-foreground font-medium">
                {nextVideo.duration} • {nextVideo.views} {t.views}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <button
              onClick={cancelAutoplay}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold py-3 rounded-xl border border-white/5 hover:border-white/10 transition-all active:scale-95 cursor-pointer font-heading"
            >
              {lang === "es" ? "CANCELAR" : "キャンセル"}
            </button>
            <Link
              href={nextUrl}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-95 text-center font-heading"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{lang === "es" ? "REPRODUCIR YA" : "今すぐ再生"}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
