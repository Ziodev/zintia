"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Film, Play } from "lucide-react";
import { Video } from "@/lib/data";
import { Language } from "@/lib/translations";
import { translateTitle } from "@/lib/auto-tagger";
import { cn, slugify } from "@/lib/utils";

interface PlaylistQueuePanelProps {
  videos: Video[];
  currentIndex: number;
  playlistParam: string;
  lang: Language;
}

export function PlaylistQueuePanel({
  videos,
  currentIndex,
  playlistParam,
  lang,
}: PlaylistQueuePanelProps) {
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  const t = {
    es: {
      title: "Tu Playlist Caliente",
      playing: "Reproduciendo",
      progress: "video {current} de {total}",
    },
    en: {
      title: "Your Hot Playlist",
      playing: "Now Playing",
      progress: "video {current} of {total}",
    },
    fr: {
      title: "Votre Playlist Chaude",
      playing: "Lecture en cours",
      progress: "vidéo {current} sur {total}",
    },
    ja: {
      title: "ホットプレイリスト",
      playing: "再生中",
      progress: "{total}本中 {current}本目",
    },
    it: {
      title: "La Tua Playlist Calda",
      playing: "In Riproduzione",
      progress: "video {current} di {total}",
    },
    pt: {
      title: "Sua Playlist Quente",
      playing: "Reproduzindo",
      progress: "vídeo {current} de {total}",
    },
  }[lang] || {
    title: "Tu Playlist Caliente",
    playing: "Reproduciendo",
    progress: "video {current} de {total}",
  };

  return (
    <div className="w-full bg-zinc-900/40 backdrop-blur-md border border-rose-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-rose-500 animate-pulse" />
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            {t.title}
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {t.progress
            .replace("{current}", (currentIndex + 1).toString())
            .replace("{total}", videos.length.toString())}
        </span>
      </div>

      {/* Playlist Items */}
      <div className="max-h-[320px] overflow-y-auto no-scrollbar p-2 space-y-1 bg-zinc-950/20">
        {videos.map((video, idx) => {
          const isActive = idx === currentIndex;
          const videoTitle = translateTitle(video.title, lang);
          const watchUrl = `/video/${slugify(videoTitle)}-${video.id}?lang=${lang}&playlist=${playlistParam}`;

          return (
            <div
              key={video.id}
              ref={isActive ? activeItemRef : null}
              className={cn(
                "flex items-center gap-2.5 rounded-xl p-2 transition-all relative group/item",
                isActive
                  ? "bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-inner"
                  : "hover:bg-zinc-900/50 border border-transparent text-muted-foreground hover:text-white"
              )}
            >
              {/* Thumbnail */}
              <div className="relative w-16 aspect-video rounded-lg overflow-hidden shrink-0 border border-white/5 bg-zinc-950 shadow">
                <Image
                  src={video.thumbnailUrl}
                  alt={videoTitle}
                  fill
                  unoptimized
                  className="object-cover"
                />
                {isActive && (
                  <div className="absolute inset-0 bg-rose-500/25 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white animate-pulse" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pr-1">
                <Link
                  href={watchUrl}
                  className={cn(
                    "text-xs font-bold line-clamp-1 leading-tight block hover:text-rose-400 transition-colors",
                    isActive ? "text-rose-400 font-extrabold" : "text-white"
                  )}
                >
                  {videoTitle}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-medium text-muted-foreground">
                  <span className="uppercase text-rose-500/80 font-semibold">{video.category}</span>
                  <span>•</span>
                  <span>{video.duration}</span>
                </div>
              </div>

              {/* Playing Badge */}
              {isActive && (
                <span className="absolute right-2 top-2 bg-rose-500 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded shadow">
                  {t.playing}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
