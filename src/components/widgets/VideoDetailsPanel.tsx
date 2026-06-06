"use client";

import { useState } from "react";
import { Eye, Clock, Tag, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { Video } from "@/lib/data";
import { cn } from "@/lib/utils";
import { translateTitle } from "@/lib/auto-tagger";

import { Language } from "@/lib/translations";

interface VideoDetailsPanelProps {
  video: Video;
  activeLang: Language;
  t: Record<string, string>;
}

export function VideoDetailsPanel({ video, activeLang, t }: VideoDetailsPanelProps) {
  const [userVote, setUserVote] = useState<"none" | "like" | "dislike">("none");
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  const hash = video.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseLikesPercent = 85 + (hash % 13);
  const likesPercent = baseLikesPercent + (userVote === "like" ? 1 : userVote === "dislike" ? -1 : 0);

  const translatedTitle = translateTitle(video.title, activeLang);

  const handleLike = () => {
    if (userVote === "like") {
      setUserVote("none");
    } else {
      setUserVote("like");
      const newHearts = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 80 + 10,
      }));
      setHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 1800);
    }
  };

  const handleDislike = () => {
    setUserVote(userVote === "dislike" ? "none" : "dislike");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: translatedTitle,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="flex flex-col gap-3.5 p-1 relative font-sans">
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateY(-140px) scale(1.3);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: floatUp 1.8s ease-out forwards;
        }
      `}</style>

      <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug">
        {translatedTitle}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {video.views} {t.views}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {video.duration}
            </span>
            <span className="flex items-center gap-1 bg-rose-500/10 text-rose-400 font-semibold px-2 py-0.5 rounded border border-rose-500/20 capitalize">
              <Tag className="w-3.5 h-3.5 inline mr-1" /> {video.category}
            </span>
          </div>

          {/* Approvals Rating Bar */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-1.5 w-32 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${likesPercent}%` }} />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">
              {likesPercent}% {activeLang === "es" ? "de aprobación" : "approval rate"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold border px-4.5 py-2 rounded-full transition-colors active:scale-95 relative overflow-visible cursor-pointer",
              userVote === "like"
                ? "bg-rose-500 border-rose-500 text-white"
                : "bg-secondary/80 border-white/5 hover:bg-zinc-800 text-white"
            )}
          >
            <ThumbsUp className="w-3.5 h-3.5 animate-in" /> <span>{t.like}</span>
            {/* Floating hearts container */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {hearts.map((h) => (
                <span
                  key={h.id}
                  className="absolute text-base pointer-events-none animate-float-up text-rose-500"
                  style={{
                    left: `${h.left}%`,
                    bottom: "100%",
                  }}
                >
                  ❤️
                </span>
              ))}
            </div>
          </button>
          
          <button 
            onClick={handleDislike}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold border px-3 py-2 rounded-full transition-colors active:scale-95 cursor-pointer",
              userVote === "dislike"
                ? "bg-zinc-700 border-zinc-700 text-white"
                : "bg-secondary/80 border-white/5 hover:bg-zinc-800 text-white"
            )}
            aria-label="No me gusta"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold bg-secondary/80 border border-white/5 px-4.5 py-2 rounded-full hover:bg-zinc-800 transition-colors text-white active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> <span>{t.share}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
