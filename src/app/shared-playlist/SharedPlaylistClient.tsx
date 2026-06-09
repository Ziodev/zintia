"use client";

import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Flame, Volume2, VolumeX, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Video } from "@/lib/data";
import { Language } from "@/lib/translations";
import { translateTitle } from "@/lib/auto-tagger";
import { cn } from "@/lib/utils";

interface SharedPlaylistClientProps {
  videos: Video[];
  lang: Language;
}

const MATCH_TRANSLATIONS = {
  es: {
    title: "Compatibilidad Caliente 🔥",
    subtitle: "Tu amigo te ha compartido su playlist caliente. ¿Cuáles de estos videos te gustan más? ¡Haz swipe para ver su compatibilidad!",
    hot: "¡HOT!",
    nope: "NOT",
    calculating: "Calculando compatibilidad...",
    yourMatch: "Tu compatibilidad es del",
    importSuccess: "¡Playlist importada con éxito!",
    importBtn: "Importar a mis Favoritos 📥",
    importedBtn: "¡Playlist Importada!",
    playGameBtn: "Crear mi propia Playlist 🎮",
    backHomeBtn: "Volver al Inicio 🏠",
    opposite: "Polos Opuestos ❄️",
    chemistry: "Tienen Química 😏",
    soulmates: "Almas Gemelas Calientes 💖",
  },
  en: {
    title: "Hot Compatibility 🔥",
    subtitle: "Your friend shared their hot playlist. Which of these videos do you like the most? Swipe to find your compatibility!",
    hot: "HOT!",
    nope: "NOT",
    calculating: "Calculating compatibility...",
    yourMatch: "Your compatibility is",
    importSuccess: "Playlist successfully imported!",
    importBtn: "Import to my Favorites 📥",
    importedBtn: "Playlist Imported!",
    playGameBtn: "Create my own Playlist 🎮",
    backHomeBtn: "Back to Home 🏠",
    opposite: "Opposite Poles ❄️",
    chemistry: "You Have Chemistry 😏",
    soulmates: "Hot Soulmates 💖",
  },
  fr: {
    title: "Compatibilité Chaude 🔥",
    subtitle: "Votre ami a partagé sa playlist chaude. Quelles vidéos préférez-vous ? Glissez pour voir votre score !",
    hot: "CHAUD !",
    nope: "NOT",
    calculating: "Calcul de la compatibilité...",
    yourMatch: "Votre compatibilité est de",
    importSuccess: "Playlist importée avec succès !",
    importBtn: "Importer dans mes Favoris 📥",
    importedBtn: "Playlist Importée !",
    playGameBtn: "Créer ma propre Playlist 🎮",
    backHomeBtn: "Retour à l'Accueil 🏠",
    opposite: "Pôles Opposés ❄️",
    chemistry: "Il y a de la Chimie 😏",
    soulmates: "Âmes Sœurs Chaudes 💖",
  },
  ja: {
    title: "相性診断 🔥",
    subtitle: "友達がホットプレイリストを共有しました。スワイプして二人の好みの相性をチェックしましょう！",
    hot: "ホット！",
    nope: "スキップ",
    calculating: "相性を計算中...",
    yourMatch: "二人の相性は",
    importSuccess: "プレイリストをインポートしました！",
    importBtn: "お気に入りに追加 📥",
    importedBtn: "追加完了！",
    playGameBtn: "自分のリストを作る 🎮",
    backHomeBtn: "ホームに戻る 🏠",
    opposite: "水と油 ❄️",
    chemistry: "相性良し 😏",
    soulmates: "運命の相手 💖",
  },
  it: {
    title: "Compatibilità Calda 🔥",
    subtitle: "Il tuo amico ha condiviso la sua playlist calda. Quali video ti piacciono di più? Trascina per vedere la compatibilità!",
    hot: "BOLLENTE!",
    nope: "PASSA",
    calculating: "Calcolo compatibilità...",
    yourMatch: "La tua compatibilità è del",
    importSuccess: "Playlist importata con successo!",
    importBtn: "Importa nei miei Preferiti 📥",
    importedBtn: "Playlist Importata!",
    playGameBtn: "Crea la mia Playlist 🎮",
    backHomeBtn: "Torna alla Home 🏠",
    opposite: "Poli Opposti ❄️",
    chemistry: "C'è Chimica 😏",
    soulmates: "Anime Gemelle Calde 💖",
  },
  pt: {
    title: "Compatibilidade Quente 🔥",
    subtitle: "Seu amigo compartilhou a playlist dele. De quais vídeos você mais gosta? Deslize para ver sua compatibilidade!",
    hot: "QUENTE!",
    nope: "PASSAR",
    calculating: "Calculando compatibilidade...",
    yourMatch: "Sua compatibilidade é de",
    importSuccess: "Playlist importada com sucesso!",
    importBtn: "Importar para meus Favoritos 📥",
    importedBtn: "Playlist Importada!",
    playGameBtn: "Criar minha Playlist 🎮",
    backHomeBtn: "Voltar ao Início 🏠",
    opposite: "Polos Opostos ❄️",
    chemistry: "Tem Química 😏",
    soulmates: "Almas Gêmeas Quentes 💖",
  },
  sl: {
    title: "Vroča združljivost 🔥",
    subtitle: "Tvoj prijatelj je delil svojo vročo predvajalno listo. Kateri od teh videoposnetkov ti je najbolj všeč? Podrsaj, da vidiš vajino združljivost!",
    hot: "VROČE!",
    nope: "PRESKOČI",
    calculating: "Računanje združljivosti...",
    yourMatch: "Vajina združljivost je",
    importSuccess: "Seznam predvajanja uspešno uvožen!",
    importBtn: "Uvozi v moje priljubljene 📥",
    importedBtn: "Seznam uvožen!",
    playGameBtn: "Ustvari svoj seznam predvajanja 🎮",
    backHomeBtn: "Nazaj na začetno stran 🏠",
    opposite: "Nasprotni poli ❄️",
    chemistry: "Imata kemijo 😏",
    soulmates: "Vroče sorodne duše 💖",
  },
};

export function SharedPlaylistClient({ videos, lang }: SharedPlaylistClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipes, setSwipes] = useState<Record<string, "left" | "right">>({});
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [imported, setImported] = useState(false);
  
  const activeLang = lang || "es";
  const t = MATCH_TRANSLATIONS[activeLang] || MATCH_TRANSLATIONS.es;

  const handleSwipe = (direction: "left" | "right") => {
    const video = videos[currentIndex];
    if (video) {
      setSwipes((prev) => ({ ...prev, [video.id]: direction }));
    }
    setExitDirection(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const triggerButtonSwipe = (direction: "left" | "right") => {
    setExitDirection(direction);
    setTimeout(() => {
      handleSwipe(direction);
    }, 250);
  };

  const isGameOver = currentIndex >= videos.length;

  // Calculate Match Score
  const hotCount = Object.values(swipes).filter((v) => v === "right").length;
  const matchPercentage = videos.length > 0 ? Math.round((hotCount / videos.length) * 100) : 0;

  const getMatchVerdict = () => {
    if (matchPercentage >= 71) return t.soulmates;
    if (matchPercentage >= 31) return t.chemistry;
    return t.opposite;
  };

  const handleImport = () => {
    if (typeof window !== "undefined") {
      // 1. Merge playlist items
      const storedPlaylist = localStorage.getItem("zintia_hot_playlist");
      let playlistData: Video[] = [];
      if (storedPlaylist) {
        try {
          playlistData = JSON.parse(storedPlaylist);
        } catch {}
      }

      videos.forEach((video) => {
        if (!playlistData.some((v) => v.id === video.id)) {
          playlistData.push(video);
        }
      });
      localStorage.setItem("zintia_hot_playlist", JSON.stringify(playlistData));
      localStorage.setItem("zintia_hot_playlist_ids", JSON.stringify(playlistData.map((v) => v.id)));

      // 2. Add categories/tags to preference scores
      const storedCats = localStorage.getItem("zintia_preferred_categories");
      let catsData: string[] = [];
      if (storedCats) {
        try {
          catsData = JSON.parse(storedCats);
        } catch {}
      }
      videos.forEach((video) => {
        if (!catsData.includes(video.category)) {
          catsData.push(video.category);
        }
      });
      localStorage.setItem("zintia_preferred_categories", JSON.stringify(catsData));

      const storedTags = localStorage.getItem("zintia_preferred_tags");
      let tagsData: string[] = [];
      if (storedTags) {
        try {
          tagsData = JSON.parse(storedTags);
        } catch {}
      }
      videos.forEach((video) => {
        if (video.tags) {
          video.tags.forEach((tag) => {
            if (!tagsData.includes(tag)) {
              tagsData.push(tag);
            }
          });
        }
      });
      localStorage.setItem("zintia_preferred_tags", JSON.stringify(tagsData));

      // Trigger update event
      window.dispatchEvent(new Event("zintia_playlist_updated"));
      setImported(true);
    }
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6 font-sans">
        <p className="text-sm text-muted-foreground mb-4">No se compartieron videos válidos.</p>
        <Link href={`/?lang=${activeLang}`} className="bg-rose-500 text-white font-bold text-xs px-6 py-3 rounded-xl">
          {t.backHomeBtn}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] px-4 flex flex-col items-center relative font-sans min-h-[550px] justify-center">
      {/* Header Info */}
      <div className="flex flex-col gap-1 text-center mb-6">
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2 justify-center font-heading">
          🔥 {t.title}
        </h2>
        {!isGameOver && (
          <p className="text-xs text-muted-foreground max-w-[280px]">
            {t.subtitle}
          </p>
        )}
      </div>

      <div className="relative w-full h-[470px] flex items-center justify-center overflow-visible">
        <AnimatePresence>
          {isGameOver ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-2xl"
            >
              {/* Pulsing Match Circle */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                <span className="absolute inset-0 rounded-full bg-rose-500/10 animate-ping opacity-75" />
                <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-rose-500 flex flex-col items-center justify-center shadow-lg shadow-rose-500/20 z-10">
                  <span className="text-3xl font-black text-white">{matchPercentage}%</span>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-rose-400">Match</span>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-white mb-2 font-heading uppercase tracking-wide">
                {getMatchVerdict()}
              </h3>
              <p className="text-xs text-muted-foreground mb-6 font-sans">
                {t.yourMatch} {matchPercentage}%
              </p>

              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={handleImport}
                  disabled={imported}
                  className={cn(
                    "w-full text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md font-heading cursor-pointer",
                    imported 
                      ? "bg-zinc-800 border border-white/10 text-emerald-400 cursor-default shadow-none" 
                      : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 animate-glow"
                  )}
                >
                  {imported ? <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> : null}
                  <span>{imported ? t.importedBtn : t.importBtn}</span>
                </button>

                <Link
                  href={`/swipe?lang=${activeLang}`}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-white/5 text-center font-heading"
                >
                  {t.playGameBtn}
                </Link>

                <Link
                  href={`/?lang=${activeLang}`}
                  className="w-full text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer font-semibold py-2 mt-1 underline"
                >
                  {t.backHomeBtn}
                </Link>
              </div>
            </motion.div>
          ) : (
            videos.slice(currentIndex, currentIndex + 3).reverse().map((video, idx, arr) => {
              const isActive = idx === arr.length - 1;
              return (
                <CardItem
                  key={video.id}
                  video={video}
                  isActive={isActive}
                  activeLang={activeLang}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                  exitDirection={isActive ? exitDirection : null}
                  onSwipe={handleSwipe}
                  arrIndex={idx}
                  t={{ hot: t.hot, nope: t.nope }}
                />
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Circle controls at bottom */}
      {!isGameOver && (
        <div className="flex items-center gap-6 justify-center mt-4 w-full">
          <button
            onClick={() => triggerButtonSwipe("left")}
            className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/10 text-sky-400 flex items-center justify-center transition-all shadow-lg active:scale-90 hover:shadow-[0_0_15px_rgba(56,189,248,0.15)] cursor-pointer"
            aria-label="Not"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => triggerButtonSwipe("right")}
            className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 text-rose-500 flex items-center justify-center transition-all shadow-lg active:scale-90 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] cursor-pointer animate-pulse"
            aria-label="Hot"
          >
            <Flame className="w-7 h-7 fill-rose-500/10 hover:fill-rose-500" />
          </button>
        </div>
      )}
    </div>
  );
}

// Reusable card component from SwipeGameClient
interface CardItemProps {
  video: Video;
  isActive: boolean;
  activeLang: Language;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  exitDirection: "left" | "right" | null;
  onSwipe: (dir: "left" | "right") => void;
  arrIndex: number;
  t: Record<string, string>;
}

function CardItem({
  video,
  isActive,
  activeLang,
  isMuted,
  setIsMuted,
  exitDirection,
  onSwipe,
  arrIndex,
  t,
}: CardItemProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-180, 0, 180], [0.4, 1, 0.4]);
  const hotOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  const videoTitle = translateTitle(video.title, activeLang);
  const isBack = arrIndex === 0;

  return (
    <motion.div
      drag={isActive}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      style={
        isActive
          ? { x, rotate, opacity, zIndex: 10 }
          : {
              scale: isBack ? 0.9 : 0.95,
              y: isBack ? 16 : 8,
              opacity: isBack ? 0.4 : 0.8,
              zIndex: arrIndex,
            }
      }
      initial={isActive ? { scale: 0.95, opacity: 0, y: 10 } : false}
      animate={
        exitDirection
          ? {
              x: exitDirection === "right" ? 400 : -400,
              rotate: exitDirection === "right" ? 25 : -25,
              opacity: 0,
            }
          : { scale: isActive ? 1 : isBack ? 0.9 : 0.95, y: isActive ? 0 : isBack ? 16 : 8, opacity: isActive ? 1 : isBack ? 0.4 : 0.8 }
      }
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={cn(
        "absolute w-full h-full bg-zinc-950 rounded-2xl overflow-hidden border shadow-2xl flex flex-col select-none",
        isActive ? "border-white/10" : "border-white/5"
      )}
    >
      <div className="relative flex-1 bg-zinc-900 w-full overflow-hidden">
        {isActive ? (
          <>
            <video
              src={video.videoPreviewUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-black/80 backdrop-blur border border-white/10 rounded-full text-white transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </>
        ) : (
          <Image
            src={video.thumbnailUrl}
            alt={videoTitle}
            fill
            unoptimized
            className="object-cover"
          />
        )}

        {isActive && (
          <>
            <motion.div
              style={{ opacity: hotOpacity }}
              className="absolute top-8 left-8 border-4 border-rose-500 text-rose-500 bg-rose-500/10 font-black rounded-lg px-4 py-1.5 text-xl tracking-widest rotate-[-12deg] z-30 uppercase pointer-events-none"
            >
              {t.hot}
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-8 border-4 border-sky-500 text-sky-500 bg-sky-500/10 font-black rounded-lg px-4 py-1.5 text-xl tracking-widest rotate-[12deg] z-30 uppercase pointer-events-none"
            >
              {t.nope}
            </motion.div>
          </>
        )}
      </div>

      <div className="p-4 bg-zinc-950 border-t border-white/5 flex flex-col gap-1 w-full shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded leading-none">
            {video.category}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {video.duration}
          </span>
        </div>
        <h4 className="text-xs sm:text-sm font-extrabold text-white leading-snug line-clamp-2 mt-0.5">
          {videoTitle}
        </h4>
      </div>
    </motion.div>
  );
}
