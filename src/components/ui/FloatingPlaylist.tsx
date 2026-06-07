"use client";

import { useEffect, useState } from "react";
import { useQueryState } from "nuqs";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Play, X, Trash2, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Video } from "@/lib/data";
import { Language, translations } from "@/lib/translations";
import { translateTitle } from "@/lib/auto-tagger";
import { slugify, getMobideaLink } from "@/lib/utils";

const PLAYLIST_TRANSLATIONS = {

  es: {
    title: "Tu Playlist Caliente",
    empty: "¡Aún no tienes videos en tu playlist!",
    emptyDesc: "Juega a 'Hot or Not' para deslizar y agregar videos calientes a tu lista.",
    playAll: "REPRODUCIR TODO",
    share: "COMPARTIR PLAYLIST",
    clear: "Limpiar todo",
    toastCopied: "¡Enlace de playlist copiado al portapapeles!",
    playGame: "JUGAR 'HOT OR NOT'",
    unlockTitle: "Desbloquear Playlists Premium 💋",
    unlockDesc: "Has alcanzado el límite de 5 videos de tu pase básico. Para guardar videos ilimitados, usar reproducción continua y disfrutar de autoplay permanente, apoya a nuestros sponsors con un registro rápido y seguro.",
    unlockBtn: "💋 Ver Modelos y Desbloquear Acceso VIP",
    unlockCancel: "Voltar a la Playlist",
  },
  en: {
    title: "Your Hot Playlist",
    empty: "No videos in your playlist yet!",
    emptyDesc: "Play 'Hot or Not' to swipe and add hot videos to your list.",
    playAll: "PLAY ALL",
    share: "SHARE PLAYLIST",
    clear: "Clear all",
    toastCopied: "Playlist link copied to clipboard!",
    playGame: "PLAY 'HOT OR NOT'",
    unlockTitle: "Unlock Premium Playlists 💋",
    unlockDesc: "You have reached the limit of 5 videos on your basic pass. To save unlimited videos, use continuous playback, and enjoy permanent autoplay, support our sponsors with a quick secure sign up.",
    unlockBtn: "💋 View Models & Unlock VIP Access",
    unlockCancel: "Back to Playlist",
  },
  fr: {
    title: "Votre Playlist Chaude",
    empty: "Aucune vidéo dans votre playlist !",
    emptyDesc: "Jouez à 'Hot or Not' pour ajouter des vidéos chaudes.",
    playAll: "TOUT LIRE",
    share: "PARTAGER LA PLAYLIST",
    clear: "Tout effacer",
    toastCopied: "Lien de la playlist copié !",
    playGame: "JOUER A 'HOT OR NOT'",
    unlockTitle: "Débloquer les Playlists Premium 💋",
    unlockDesc: "Vous avez atteint la limite de 5 vidéos de votre pass de base. Pour enregistrer des vidéos illimitées et profiter d'une lecture continue, soutenez nos sponsors.",
    unlockBtn: "💋 Voir les Modèles & Débloquer",
    unlockCancel: "Retour à la Playlist",
  },
  ja: {
    title: "ホットプレイリスト",
    empty: "プレイリストは空です",
    emptyDesc: "「Hot or Not」ゲームをプレイして動画を追加しましょう。",
    playAll: "すべて再生",
    share: "プレイリストを共有",
    clear: "すべてクリア",
    toastCopied: "リンクをコピーしました！",
    playGame: "「HOT OR NOT」をプレイ",
    unlockTitle: "プレミアムプレイリストを解除 💋",
    unlockDesc: "ベーシックパスの制限数5個に達しました。無制限保存、連続再生、自動再生を楽しむには、スポンサーの登録をお願いします。",
    unlockBtn: "💋 ライブモデルを見て解除",
    unlockCancel: "プレイリストに戻る",
  },
  it: {
    title: "La Tua Playlist Calda",
    empty: "Ancora nessun video nella tua playlist!",
    emptyDesc: "Gioca a 'Hot or Not' per aggiungere video caldi.",
    playAll: "RIPRODUCI TUTTO",
    share: "CONDIVIDI PLAYLIST",
    clear: "Cancella tutto",
    toastCopied: "Link copiato negli appunti!",
    playGame: "GIOCA A 'HOT OR NOT'",
    unlockTitle: "Sblocca Playlist Premium 💋",
    unlockDesc: "Hai raggiunto il limite di 5 video del tuo pass base. Per salvare video illimitati e usare l'autoplay permanente, registrati in modo sicuro con i nostri partner.",
    unlockBtn: "💋 Vedi Modelle e Sblocca Accesso VIP",
    unlockCancel: "Torna alla Playlist",
  },
  pt: {
    title: "Sua Playlist Quente",
    empty: "Nenhum vídeo na sua playlist ainda!",
    emptyDesc: "Jogue 'Hot or Not' para adicionar vídeos quentes.",
    playAll: "REPRODUZIR TUDO",
    share: "COMPARTILHAR PLAYLIST",
    clear: "Limpar tudo",
    toastCopied: "Link copiado para a área de transferência!",
    playGame: "JOGAR 'HOT OR NOT'",
    unlockTitle: "Desbloquear Playlists Premium 💋",
    unlockDesc: "Você atingiu o limite de 5 vídeos do seu passe básico. Para salvar vídeos ilimitados e reprodução contínua permanente, apoie nossos patrocinadores.",
    unlockBtn: "💋 Ver Modelos e Desbloquear Acesso VIP",
    unlockCancel: "Voltar para Playlist",
  },
};

export function FloatingPlaylist() {
  const [isOpen, setIsOpen] = useState(false);
  const [playlist, setPlaylist] = useState<Video[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [lang] = useQueryState("lang", { defaultValue: "es" });

  const activeLang = (lang as Language) || "es";
  const t = PLAYLIST_TRANSLATIONS[activeLang] || PLAYLIST_TRANSLATIONS.es;
  const globalT = translations[activeLang] || translations.es;

  // Load and subscribe to playlist changes
  const loadPlaylist = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zintia_hot_playlist");
      if (stored) {
        try {
          setPlaylist(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse playlist from localStorage:", e);
        }
      } else {
        setPlaylist([]);
      }
    }
  };

  useEffect(() => {
    loadPlaylist();

    const handleTriggerUnlock = () => {
      setShowUnlockModal(true);
    };

    // Listen to custom updates and storage updates
    window.addEventListener("zintia_playlist_updated", loadPlaylist);
    window.addEventListener("storage", loadPlaylist);
    window.addEventListener("zintia_trigger_unlock_modal", handleTriggerUnlock);

    return () => {
      window.removeEventListener("zintia_playlist_updated", loadPlaylist);
      window.removeEventListener("storage", loadPlaylist);
      window.removeEventListener("zintia_trigger_unlock_modal", handleTriggerUnlock);
    };
  }, []);

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("zintia_hot_playlist");
      localStorage.removeItem("zintia_hot_playlist_ids");
      localStorage.removeItem("zintia_preferred_categories");
      localStorage.removeItem("zintia_preferred_tags");
      window.dispatchEvent(new Event("zintia_playlist_updated"));
    }
  };

  const handleShare = () => {
    if (playlist.length === 0) return;
    const base = window.location.origin;
    const playlistIds = playlist.map((v) => v.id).join(",");
    const firstVideo = playlist[0];
    const firstSlug = slugify(translateTitle(firstVideo.title, activeLang));
    const shareUrl = `${base}/video/${firstSlug}-${firstVideo.id}?lang=${activeLang}&playlist=${playlistIds}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const handleRemoveItem = (id: string) => {
    const updated = playlist.filter((v) => v.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem("zintia_hot_playlist", JSON.stringify(updated));
      localStorage.setItem("zintia_hot_playlist_ids", JSON.stringify(updated.map((v) => v.id)));
      window.dispatchEvent(new Event("zintia_playlist_updated"));
    }
  };

  // If the playlist has 0 items, hide the floating button
  if (playlist.length === 0 && !isOpen) return null;

  const playlistIds = playlist.map((v) => v.id).join(",");
  const playUrl = playlist.length > 0
    ? `/video/${slugify(translateTitle(playlist[0].title, activeLang))}-${playlist[0].id}?lang=${activeLang}&playlist=${playlistIds}`
    : "#";

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-emerald-400/20 font-sans"
          >
            <span>{t.toastCopied}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-zinc-950/90 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-[0_4px_20px_rgba(244,63,94,0.2)] hover:scale-110 cursor-pointer animate-glow group focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
        aria-label="Open playlist"
      >
        <Film className="w-6 h-6 group-hover:animate-pulse" />
        {playlist.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-[10px] font-black text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-950 animate-bounce">
            {playlist.length}
          </span>
        )}
      </button>

      {/* Drawer Overlay & Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm"
            />

            {/* Sidebar Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-zinc-950 border-l border-white/5 shadow-2xl flex flex-col font-sans focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              aria-label="Hot Playlist Drawer"
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-rose-500" />
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wide">
                    {t.title}
                  </h3>
                  <span className="bg-rose-500/10 text-rose-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {playlist.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {playlist.length > 0 && (
                    <button
                      onClick={handleClear}
                      className="text-xs text-muted-foreground hover:text-rose-400 font-semibold transition-colors flex items-center gap-1 cursor-pointer mr-2 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.clear}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {playlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 px-6 h-full">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-muted-foreground mb-4">
                      <Film className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-extrabold text-white mb-2 uppercase tracking-wider">
                      {t.empty}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mb-6">
                      {t.emptyDesc}
                    </p>
                    <Link
                      href={`/swipe?lang=${activeLang}`}
                      onClick={() => setIsOpen(false)}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-rose-500/20 text-center font-heading focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
                    >
                      {t.playGame}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {playlist.map((video) => {
                      const videoTitle = translateTitle(video.title, activeLang);
                      return (
                        <div
                          key={video.id}
                          className="flex items-center gap-3 bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 rounded-2xl p-2.5 transition-all group/item"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-20 aspect-video rounded-lg overflow-hidden shrink-0 border border-white/5 bg-zinc-950">
                            <Image
                              src={video.thumbnailUrl}
                              alt={videoTitle}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            <span className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[8px] font-bold text-white">
                              {video.duration}
                            </span>
                          </div>

                          {/* Title & Info */}
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-rose-400 block mb-0.5">
                              {video.category}
                            </span>
                            <Link
                              href={`/video/${slugify(videoTitle)}-${video.id}?lang=${activeLang}`}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover/item:text-rose-400 transition-colors"
                            >
                              {videoTitle}
                            </Link>
                            <span className="text-[9px] text-muted-foreground block mt-1">
                              {video.views} {globalT.views}
                            </span>
                          </div>

                          {/* Actions */}
                          <button
                            onClick={() => handleRemoveItem(video.id)}
                            className="p-1.5 text-muted-foreground hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                            aria-label="Remove video"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {playlist.length > 0 && (
                <div className="p-4 border-t border-white/5 bg-zinc-900/20 flex flex-col gap-2.5">
                  <button
                    onClick={(e) => {
                      const isUnlocked = typeof window !== "undefined" && localStorage.getItem("zintia_playlist_unlocked") === "true";
                      if (playlist.length > 5 && !isUnlocked) {
                        e.preventDefault();
                        setShowUnlockModal(true);
                      } else {
                        setIsOpen(false);
                        window.location.href = playUrl;
                      }
                    }}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-rose-500/20 text-center font-heading animate-glow cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{t.playAll}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-white/5 cursor-pointer font-heading focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                  >
                    <Share2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t.share}</span>
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUnlockModal(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-55 w-[calc(100%-2rem)] max-w-sm bg-zinc-950 border border-rose-500/20 rounded-3xl p-6 md:p-8 text-center shadow-2xl font-sans focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              role="dialog"
              aria-modal="true"
              aria-labelledby="playlist-unlock-title"
              aria-describedby="playlist-unlock-desc"
            >
              <div className="bg-rose-500/10 text-rose-500 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
                <Film className="w-7 h-7" />
              </div>
              <h3 id="playlist-unlock-title" className="text-sm md:text-base font-black text-white mb-2 uppercase tracking-wide">
                {t.unlockTitle}
              </h3>
              <p id="playlist-unlock-desc" className="text-[11px] text-muted-foreground leading-relaxed mb-6">
                {t.unlockDesc}
              </p>
              
              <div className="flex flex-col gap-2.5">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.setItem("zintia_playlist_unlocked", "true");
                    window.dispatchEvent(new Event("zintia_playlist_updated"));
                    setShowUnlockModal(false);
                    window.location.href = getMobideaLink("floating_playlist");
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-rose-500/20 animate-glow block text-center font-heading focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
                >
                  {t.unlockBtn}
                </a>
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="text-xs text-muted-foreground hover:text-white transition-colors py-2 font-semibold font-sans hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none rounded"
                >
                  {t.unlockCancel}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
