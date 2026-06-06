"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { X, Flame, RefreshCw, Play, Share2, Volume2, VolumeX, AlertCircle, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Video } from "@/lib/data";
import { Language } from "@/lib/translations";
import { translateTitle } from "@/lib/auto-tagger";
import { cn, slugify } from "@/lib/utils";

interface SwipeGameClientProps {
  initialVideos: Video[];
  lang: Language;
}

const GAME_TRANSLATIONS = {
  es: {
    title: "Hot or Not",
    subtitle: "Desliza derecha (HOT) para agregar a tu playlist, o izquierda (NOT) para pasar.",
    hot: "¡HOT!",
    nope: "NOT",
    congrats: "¡Tu Playlist Caliente está lista!",
    noLikesTitle: "¿Muy exigente hoy?",
    noLikesDesc: "No has marcado ningún video como caliente. ¡Vuelve a intentarlo para encontrar algo que te guste!",
    likedCount: "Has seleccionado {count} videos excelentes para tu playlist.",
    playPlaylist: "REPRODUCIR PLAYLIST",
    sharePlaylist: "COMPARTIR PLAYLIST",
    playAgain: "JUGAR DE NUEVO",
    backHome: "VOLVER AL INICIO",
    copied: "¡Enlace de playlist copiado al portapapeles!",
  },
  en: {
    title: "Hot or Not",
    subtitle: "Swipe right (HOT) to add to your playlist, or left (NOT) to pass.",
    hot: "HOT!",
    nope: "NOT",
    congrats: "Your Hot Playlist is ready!",
    noLikesTitle: "Very picky today?",
    noLikesDesc: "You haven't liked any videos. Try again to find something hot!",
    likedCount: "You have selected {count} hot videos for your playlist.",
    playPlaylist: "PLAY PLAYLIST",
    sharePlaylist: "SHARE PLAYLIST",
    playAgain: "PLAY AGAIN",
    backHome: "BACK TO HOME",
    copied: "Playlist link copied to clipboard!",
  },
  fr: {
    title: "Hot or Not",
    subtitle: "Glissez à droite (HOT) pour ajouter à votre playlist, ou à gauche (NOT) pour passer.",
    hot: "CHAUD!",
    nope: "NOT",
    congrats: "Votre Playlist Chaude est prête!",
    noLikesTitle: "Très difficile aujourd'hui?",
    noLikesDesc: "Vous n'avez aimé aucune vidéo. Réessayez pour trouver quelque chose d'intéressant!",
    likedCount: "Vous avez sélectionné {count} vidéos chaudes pour votre playlist.",
    playPlaylist: "LIRE LA PLAYLIST",
    sharePlaylist: "PARTAGER LA PLAYLIST",
    playAgain: "JOUER À NOUVEAU",
    backHome: "RETOUR À L'ACCUEIL",
    copied: "Lien de la playlist copié dans le presse-papiers!",
  },
  ja: {
    title: "Hot or Not",
    subtitle: "右スワイプ（HOT）でプレイリストに追加、左スワイプ（NOT）でスキップ。",
    hot: "ホット！",
    nope: "スキップ",
    congrats: "ホットプレイリストの準備ができました！",
    noLikesTitle: "今日は選り好み？",
    noLikesDesc: "お気に入りの動画が見つかりませんでした。もう一度試してみましょう！",
    likedCount: "プレイリストに{count}個の動画が追加されました。",
    playPlaylist: "プレイリストを再生",
    sharePlaylist: "プレイリストを共有",
    playAgain: "もう一度遊ぶ",
    backHome: "ホームに戻る",
    copied: "プレイリストのリンクをクリップボードにコピーしました！",
  },
  it: {
    title: "Hot or Not",
    subtitle: "Trascina a destra (HOT) per aggiungere alla playlist, o a sinistra (NOT) per passare.",
    hot: "BOLLENTE!",
    nope: "PASSA",
    congrats: "La tua Playlist Calda è pronta!",
    noLikesTitle: "Molto esigente oggi?",
    noLikesDesc: "Non hai aggiunto nessun video alla playlist. Riprova per trovare qualcosa di caldo!",
    likedCount: "Hai selezionato {count} video caldi per la tua playlist.",
    playPlaylist: "RIPRODUCI PLAYLIST",
    sharePlaylist: "CONDIVIDI PLAYLIST",
    playAgain: "GIOCA ANCORA",
    backHome: "TORNA ALLA HOME",
    copied: "Link della playlist copiato negli appunti!",
  },
  pt: {
    title: "Hot or Not",
    subtitle: "Deslize para a direita (HOT) para adicionar à sua playlist, ou para a esquerda (NOT) para passar.",
    hot: "QUENTE!",
    nope: "PASSAR",
    congrats: "Sua Playlist Quente está pronta!",
    noLikesTitle: "Muito exigente hoje?",
    noLikesDesc: "Você não curtiu nenhum vídeo. Tente novamente para encontrar algo quente!",
    likedCount: "Você selecionou {count} vídeos quentes para sua playlist.",
    playPlaylist: "REPRODUZIR PLAYLIST",
    sharePlaylist: "COMPARTILHAR PLAYLIST",
    playAgain: "JOGAR NOVAMENTE",
    backHome: "VOLTAR AO INÍCIO",
    copied: "Link da playlist copiado para a área de transferência!",
  },
};

export function SwipeGameClient({ initialVideos, lang }: SwipeGameClientProps) {
  const [deck, setDeck] = useState<Video[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hotList, setHotList] = useState<Video[]>([]);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showToast, setShowToast] = useState(false);
  
  const activeLang = lang || "es";
  const t = GAME_TRANSLATIONS[activeLang] || GAME_TRANSLATIONS.es;

  const handleSwipe = (direction: "left" | "right") => {
    const swipedVideo = deck[currentIndex];
    if (direction === "right") {
      setHotList((prev) => [...prev, swipedVideo]);
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

  const handleRestart = () => {
    // Reshuffle deck from initial videos
    const reshuffled = [...initialVideos].sort(() => Math.random() - 0.5);
    setDeck(reshuffled);
    setHotList([]);
    setCurrentIndex(0);
    setExitDirection(null);
  };

  const handleCopyLink = () => {
    if (hotList.length === 0) return;
    const base = window.location.origin;
    const playlistIds = hotList.map((v) => v.id).join(",");
    const firstVideoId = hotList[0].id;
    const shareUrl = `${base}/video/${slugify(translateTitle(hotList[0].title, activeLang))}-${firstVideoId}?lang=${activeLang}&playlist=${playlistIds}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    });
  };

  const isGameOver = currentIndex >= deck.length;

  return (
    <div className="w-full max-w-[400px] px-4 flex flex-col items-center relative font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-emerald-400/20"
          >
            <span>{t.copied}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
              {hotList.length === 0 ? (
                <>
                  <div className="bg-rose-500/10 text-rose-500 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-heading">
                    {t.noLikesTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-sans">
                    {t.noLikesDesc}
                  </p>
                  <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
                    <button
                      onClick={handleRestart}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-rose-500/20 cursor-pointer font-heading"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t.playAgain}</span>
                    </button>
                    <Link
                      href={`/?lang=${activeLang}`}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-white/5 text-center font-heading"
                    >
                      <span>{t.backHome}</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-rose-500/10 text-rose-500 p-3.5 rounded-full mb-4 animate-glow">
                    <Flame className="w-7 h-7 fill-rose-500" />
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-2 font-heading uppercase tracking-wide">
                    {t.congrats}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-5">
                    {t.likedCount.replace("{count}", hotList.length.toString())}
                  </p>

                  {/* Liked videos mini grid */}
                  <div className="grid grid-cols-4 gap-2 w-full max-h-[160px] overflow-y-auto pr-1 no-scrollbar mb-6">
                    {hotList.slice(0, 8).map((video) => (
                      <div
                        key={video.id}
                        className="relative aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-white/5 shadow"
                      >
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {hotList.length > 8 && (
                      <div className="aspect-video bg-zinc-850 rounded-lg border border-white/5 flex items-center justify-center text-[10px] font-extrabold text-rose-400">
                        +{hotList.length - 8}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5 w-full">
                    <Link
                      href={`/video/${slugify(translateTitle(hotList[0].title, activeLang))}-${hotList[0].id}?lang=${activeLang}&playlist=${hotList.map((v) => v.id).join(",")}`}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-rose-500/20 text-center font-heading animate-glow"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{t.playPlaylist}</span>
                    </Link>
                    
                    <button
                      onClick={handleCopyLink}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-white/5 cursor-pointer font-heading"
                    >
                      <Share2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>{t.sharePlaylist}</span>
                    </button>

                    <button
                      onClick={handleRestart}
                      className="w-full text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer font-semibold py-2 mt-1 underline"
                    >
                      {t.playAgain}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            deck.slice(currentIndex, currentIndex + 3).reverse().map((video, idx, arr) => {
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
                  t={t}
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
  
  // Transform values for dragging effect
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

  // Stack styling offsets
  const isBack = arrIndex === 0;
  const isMiddle = arrIndex === 1;

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
      {/* Video Loop / Poster */}
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
            {/* Audio Toggle Speaker Button */}
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

        {/* Hot / Nope Stamps Overlaid during dragging */}
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

      {/* Info details overlay footer */}
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
