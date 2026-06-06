"use client";

import { useState } from "react";
import { Eye, Clock, Tag, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { Video } from "@/lib/data";
import { cn } from "@/lib/utils";
import { translateTitle } from "@/lib/auto-tagger";
import { Language } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";

interface VideoDetailsPanelProps {
  video: Video;
  activeLang: Language;
  t: Record<string, string>;
}

interface HeartParticle {
  id: number;
  xStart: number;
  xOffset: number[];
  scale: number;
  rotate: number;
}

export function VideoDetailsPanel({ video, activeLang, t }: VideoDetailsPanelProps) {
  const [userVote, setUserVote] = useState<"none" | "like" | "dislike">("none");
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  const hash = video.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseLikesPercent = 85 + (hash % 13);
  const likesPercent = baseLikesPercent + (userVote === "like" ? 1 : userVote === "dislike" ? -1 : 0);

  const translatedTitle = translateTitle(video.title, activeLang);

  const handleLike = () => {
    if (userVote === "like") {
      setUserVote("none");
    } else {
      setUserVote("like");
      
      // Emit floating hearts with random coordinates and sways
      const newHearts = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        xStart: Math.random() * 60 + 20, // 20% to 80%
        xOffset: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40], // drift pattern
        scale: Math.random() * 0.6 + 0.6, // scale between 0.6 and 1.2
        rotate: (Math.random() - 0.5) * 40, // rotation swing
      }));

      setHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 1500);
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
          {/* Like Button */}
          <motion.button 
            onClick={handleLike}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold border px-4.5 py-2 rounded-full transition-colors relative overflow-visible cursor-pointer",
              userVote === "like"
                ? "bg-rose-500 border-rose-500 text-white"
                : "bg-secondary/80 border-white/5 hover:bg-zinc-800 text-white"
            )}
          >
            <ThumbsUp className={cn("w-3.5 h-3.5 transition-transform", userVote === "like" && "scale-115 fill-white")} /> 
            <span>{t.like}</span>
            
            {/* Floating hearts container */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              <AnimatePresence>
                {hearts.map((h) => (
                  <motion.span
                    key={h.id}
                    initial={{ y: 0, x: 0, opacity: 0, scale: 0.4, rotate: 0 }}
                    animate={{
                      y: -140,
                      x: h.xOffset,
                      opacity: [0, 1, 1, 0],
                      scale: [0.4, h.scale, h.scale, 0.3],
                      rotate: h.rotate,
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                    className="absolute pointer-events-none text-base text-rose-500 z-50 select-none"
                    style={{
                      left: `${h.xStart}%`,
                      bottom: "100%",
                    }}
                  >
                    ❤️
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </motion.button>
          
          {/* Dislike Button */}
          <motion.button 
            onClick={handleDislike}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold border px-3 py-2 rounded-full transition-colors cursor-pointer",
              userVote === "dislike"
                ? "bg-zinc-700 border-zinc-700 text-white"
                : "bg-secondary/80 border-white/5 hover:bg-zinc-800 text-white"
            )}
            aria-label="No me gusta"
          >
            <ThumbsDown className={cn("w-3.5 h-3.5", userVote === "dislike" && "fill-white")} />
          </motion.button>

          {/* Share Button */}
          <motion.button 
            onClick={handleShare}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-secondary/80 border border-white/5 px-4.5 py-2 rounded-full hover:bg-zinc-800 transition-colors text-white cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> <span>{t.share}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
