"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Sparkles, Play } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { Video } from "@/lib/data";
import { DRTUBER_FALLBACK_VIDEOS } from "@/lib/drtuber_fallback";
import { translateTitle } from "@/lib/auto-tagger";
import { slugify } from "@/lib/utils";

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function SurpriseModal({ isOpen, onClose, lang }: SurpriseModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const t = translations[lang] || translations.es;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pool of videos to choose from
  const videoPool = DRTUBER_FALLBACK_VIDEOS;

  const startSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setSelectedVideo(null);
    setCountdown(null);

    let speed = 40; // Initial interval speed (ms)
    let duration = 0;
    const maxDuration = 1500; // Duration of spin in ms

    const spin = () => {
      // Pick a random video from the pool to show during the spin
      const randomIdx = Math.floor(Math.random() * videoPool.length);
      setCurrentVideo(videoPool[randomIdx]);

      duration += speed;
      
      // Decelerate the spinning speed
      if (duration > maxDuration * 0.8) {
        speed = 250;
      } else if (duration > maxDuration * 0.5) {
        speed = 120;
      } else if (duration > maxDuration * 0.3) {
        speed = 70;
      }

      if (duration < maxDuration) {
        timerRef.current = setTimeout(spin, speed);
      } else {
        // Spin finished: Choose final video
        const winnerIdx = Math.floor(Math.random() * videoPool.length);
        const winner = videoPool[winnerIdx];
        
        setCurrentVideo(winner);
        setSelectedVideo(winner);
        setSpinning(false);
        
        // Start countdown to redirect
        setCountdown(4);
      }
    };

    spin();
  };

  useEffect(() => {
    if (isOpen) {
      startSpin();
    } else {
      // Cleanup on close
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setSpinning(false);
      setSelectedVideo(null);
      setCountdown(null);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && selectedVideo) {
      // Redirect
      window.location.href = `/video/${slugify(translateTitle(selectedVideo.title, lang))}-${selectedVideo.id}?lang=${lang}`;
    }

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown, selectedVideo, lang]);

  if (!isOpen) return null;

  const translatedTitle = currentVideo ? translateTitle(currentVideo.title, lang) : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.15)] flex flex-col font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={spinning}
          className="absolute top-4 right-4 z-50 p-2 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 flex flex-col items-center gap-1 text-center">
          <div className="bg-rose-500/10 p-2 rounded-2xl border border-rose-500/20 text-rose-500 animate-bounce">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black tracking-tight text-white uppercase font-heading">
            {lang === "es" ? "¡Video Sorpresa!" : lang === "ja" ? "サプライズ動画！" : "Surprise Video!"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {spinning 
              ? (lang === "es" ? "Girando la ruleta de la suerte..." : "ルーレットを回しています...") 
              : (lang === "es" ? "¡Tenemos un ganador para ti!" : "当選動画が決まりました！")
            }
          </p>
        </div>

        {/* Display / Reel Slot */}
        <div className="px-6 pb-6 flex flex-col items-center">
          <div className={`relative w-full aspect-video rounded-2xl overflow-hidden border-2 bg-zinc-900 transition-all duration-300 ${
            spinning 
              ? "border-yellow-500/40 shadow-[0_0_25px_rgba(234,179,8,0.15)] scale-[0.98]" 
              : "border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.3)] scale-100"
          }`}>
            
            {currentVideo && (
              <>
                <Image
                  src={currentVideo.thumbnailUrl}
                  alt="Previsualización"
                  fill
                  unoptimized
                  className={`object-cover ${spinning ? "blur-[1px] opacity-75" : "blur-0 opacity-100"} transition-all duration-150`}
                />
                
                {/* Rolling blur overlay line */}
                {spinning && (
                  <div className="absolute inset-x-0 h-10 bg-white/10 blur-md animate-pulse top-1/2 -translate-y-1/2" />
                )}
              </>
            )}

            {/* Live Count overlay if winner */}
            {!spinning && selectedVideo && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                <Link
                  href={`/video/${slugify(translateTitle(selectedVideo.title, lang))}-${selectedVideo.id}?lang=${lang}`}
                  className="bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-full shadow-lg shadow-rose-500/30 hover:scale-110 active:scale-95 transition-all duration-300"
                >
                  <Play className="w-6 h-6 fill-white" />
                </Link>
              </div>
            )}
          </div>

          {/* Winner Title and Details */}
          {currentVideo && (
            <div className="mt-4 text-center max-w-xs flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {currentVideo.category}
              </span>
              <h4 className="text-sm font-extrabold text-white line-clamp-2 leading-tight">
                {translatedTitle}
              </h4>
            </div>
          )}

          {/* Countdown & Actions */}
          <div className="w-full mt-6 flex flex-col items-center gap-3">
            {countdown !== null && countdown > 0 && selectedVideo && (
              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full text-rose-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>
                  {lang === "es" 
                    ? `Redirigiendo en ${countdown} segundos...` 
                    : `リダイレクト中 ${countdown} 秒...`
                  }
                </span>
              </div>
            )}

            {!spinning && selectedVideo && (
              <Link
                href={`/video/${slugify(translateTitle(selectedVideo.title, lang))}-${selectedVideo.id}?lang=${lang}`}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-95 text-center font-heading"
              >
                <span>{lang === "es" ? "VER AHORA" : "今すぐ見る"}</span>
              </Link>
            )}

            {spinning && (
              <div className="h-[46px] w-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
