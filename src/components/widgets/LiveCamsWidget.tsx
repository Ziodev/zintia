"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { Tv, ExternalLink } from "lucide-react";
import { Video } from "@/lib/data";
import { translations, Language } from "@/lib/translations";
import { cn, getMobideaLink } from "@/lib/utils";

interface LiveCamsWidgetProps {
  currentVideo: Video;
  allVideos: Video[];
}

const MODEL_NAMES = [
  "Sofia_Latina",
  "Chloe_Babe",
  "Kendra_Anal",
  "Elena_MILF",
  "Aria_Amateur",
  "Yuki_Asian",
  "Ebony_Goddess",
  "Roxie_Hardcore",
  "Nikki_Squirt",
  "Kiara_Ebony",
  "Luna_Redhead",
  "Mila_Homemade",
  "Sasha_Tease",
  "Nina_Dildo",
  "Kat_Voyeur"
];

export function LiveCamsWidget({ currentVideo, allVideos }: LiveCamsWidgetProps) {
  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // State to track hovered items for previewing video
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Find 3 related videos to use as live webcam streams (useMemo to prevent unnecessary effects)
  const relatedModels = useMemo(() => {
    // 1. Get videos in the same category
    let candidates = allVideos.filter(
      (v) => v.id !== currentVideo.id && v.category === currentVideo.category
    );

    // 2. If not enough, fall back to matching tags
    if (candidates.length < 3 && currentVideo.tags) {
      const tagCandidates = allVideos.filter(
        (v) =>
          v.id !== currentVideo.id &&
          !candidates.some((c) => c.id === v.id) &&
          v.tags?.some((tag) => currentVideo.tags?.includes(tag))
      );
      candidates = [...candidates, ...tagCandidates];
    }

    // 3. If still not enough, fill with any other videos
    if (candidates.length < 3) {
      const extraCandidates = allVideos.filter(
        (v) => v.id !== currentVideo.id && !candidates.some((c) => c.id === v.id)
      );
      candidates = [...candidates, ...extraCandidates];
    }

    return candidates.slice(0, 3);
  }, [currentVideo, allVideos]);

  // Generate a fake viewers count that fluctuates
  const getInitialViewers = (id: string) => {
    const numId = parseInt(id) || 12345;
    return (numId % 2800) + 350;
  };

  const [viewers, setViewers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (relatedModels.length === 0) return;

    // Initialize viewers
    const initialViewers: Record<string, number> = {};
    relatedModels.forEach((m) => {
      initialViewers[m.id] = getInitialViewers(m.id);
    });

    const initTimer = setTimeout(() => {
      setViewers(initialViewers);
    }, 0);

    // Fluctuate counts
    const interval = setInterval(() => {
      setViewers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          const delta = Math.floor(Math.random() * 15) - 7; // -7 to +7
          next[id] = Math.max(100, next[id] + delta);
        });
        return next;
      });
    }, 4000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [relatedModels]);

  const getModelName = (video: Video) => {
    const numId = parseInt(video.id) || 0;
    const nameIndex = numId % MODEL_NAMES.length;
    return MODEL_NAMES[nameIndex];
  };

  if (relatedModels.length === 0) return null;

  return (
    <section 
      className="w-full flex flex-col gap-4 mt-6 p-4.5 bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-2xl"
      aria-label="Modelos en vivo"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
        <Tv className="w-4 h-4 text-rose-500 shrink-0" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          {t.live_models_title}
        </h3>
        <span className="ml-auto text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span>Live</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {relatedModels.map((model) => {
          const modelName = getModelName(model);
          const activeViewers = viewers[model.id] || getInitialViewers(model.id);
          const isHovered = hoveredId === model.id;

          return (
            <a
              key={model.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = getMobideaLink("live_cams_widget_" + modelName.toLowerCase());
              }}
              onMouseEnter={() => setHoveredId(model.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative flex flex-col bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-rose-500/50 rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-rose-500/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
            >

              {/* Media Section */}
              <div 
                className="block relative w-full aspect-video bg-zinc-950 overflow-hidden"
                style={{ aspectRatio: "16/9" }}
              >
                {/* Flashing Live Indicator */}
                <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 z-20 shadow-lg shadow-rose-500/20">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  <span>LIVE</span>
                </div>

                {/* Viewers Badge */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[8px] font-medium px-1.5 py-0.5 rounded border border-white/5 z-20">
                  {activeViewers.toLocaleString()} {t.watching}
                </div>

                {/* Thumbnail Poster */}
                <Image
                  src={model.thumbnailUrl}
                  alt={modelName}
                  fill
                  unoptimized
                  className={cn(
                    "object-cover transition-opacity duration-300 z-10",
                    isHovered ? "opacity-0" : "opacity-100"
                  )}
                />

                {/* Live Stream Preview Video on Hover */}
                {isHovered && (
                  <video
                    src={model.videoPreviewUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Hover Play CTA */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <span className="text-[10px] font-bold text-white bg-rose-500 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-rose-500/25">
                    {t.enter_free}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>

              {/* Model Info */}
              <div className="p-2.5 flex flex-col gap-1">
                <span className="text-xs font-bold text-white group-hover:text-rose-500 transition-colors">
                  @{modelName}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{activeLang === "es" ? "Disponible para chat privado" : activeLang === "ja" ? "プライベートチャット可能" : "Available for private chat"}</span>
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
