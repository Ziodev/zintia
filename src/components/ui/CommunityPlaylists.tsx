"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, ThumbsUp, Flame, Star, Award } from "lucide-react";
import { Video } from "@/lib/data";
import { Language } from "@/lib/translations";
import { translateTitle } from "@/lib/auto-tagger";
import { slugify } from "@/lib/utils";

interface CommunityPlaylistsProps {
  videos: Video[];
  lang: Language;
}

const PLAYLISTS_TRANSLATIONS: Record<Language, {
  sectionTitle: string;
  sectionDesc: string;
  playAll: string;
  likes: string;
  videosCount: string;
  pl1_title: string;
  pl1_desc: string;
  pl2_title: string;
  pl2_desc: string;
  pl3_title: string;
  pl3_desc: string;
}> = {
  es: {
    sectionTitle: "🏆 Playlists Populares de la Comunidad",
    sectionDesc: "Colecciones calientes recomendadas por la comunidad de Zintia Vids.",
    playAll: "Reproducir Todo",
    likes: "likes",
    videosCount: "{count} videos",
    pl1_title: "Lo más Casero de 2026",
    pl1_desc: "Las mejores grabaciones amateurs y encuentros íntimos 100% reales.",
    pl2_title: "Latinas de Infarto",
    pl2_desc: "Una selección ardiente con el mejor sabor, pasión y curvas latinas.",
    pl3_title: "Amateur de Elite",
    pl3_desc: "Nuevas caras y talentos independientes recomendados por la comunidad.",
  },
  en: {
    sectionTitle: "🏆 Popular Community Playlists",
    sectionDesc: "Hot collections curated and recommended by the Zintia Vids community.",
    playAll: "Play All",
    likes: "likes",
    videosCount: "{count} videos",
    pl1_title: "Best Homemade of 2026",
    pl1_desc: "The hottest amateur recordings and 100% real intimate encounters.",
    pl2_title: "Sizzling Latinas",
    pl2_desc: "A hot selection showcasing the best latin flavor, passion, and curves.",
    pl3_title: "Elite Amateur Talent",
    pl3_desc: "Fresh faces and independent creators recommended by the community.",
  },
  fr: {
    sectionTitle: "🏆 Playlists Populaires de la Communauté",
    sectionDesc: "Collections chaudes recommandées par la communauté.",
    playAll: "Tout lire",
    likes: "mentions j'aime",
    videosCount: "{count} vidéos",
    pl1_title: "Le Meilleur du Casseur de 2026",
    pl1_desc: "Les meilleurs enregistrements amateurs et rencontres intimes.",
    pl2_title: "Latinas de Rêve",
    pl2_desc: "Une sélection brûlante avec les meilleures courbes latines.",
    pl3_title: "Élite Amateur",
    pl3_desc: "Nouveaux visages et créateurs indépendants recommandés.",
  },
  ja: {
    sectionTitle: "🏆 コミュニティ人気プレイリスト",
    sectionDesc: "Zintia Vidsコミュニティが選ぶホットなプレイリスト集。",
    playAll: "すべて再生",
    likes: "いいね",
    videosCount: "{count}本の動画",
    pl1_title: "2026年ベスト素人投稿",
    pl1_desc: "完全リアルなインディーズ撮影と親密な出会いをお届け。",
    pl2_title: "情熱のラテン系美女",
    pl2_desc: "情熱的でグラマラスなラテン系美女の厳選コレクション。",
    pl3_title: "エリート素人特集",
    pl3_desc: "ユーザーが推薦するフレッシュな素人独立クリエイター。",
  },
  it: {
    sectionTitle: "🏆 Playlist Popolari della Community",
    sectionDesc: "Collezioni calde consigliate e curate dagli utenti.",
    playAll: "Riproduci Tutto",
    likes: "mi piace",
    videosCount: "{count} video",
    pl1_title: "Il Meglio del Casalingo 2026",
    pl1_desc: "I migliori video amatoriali e incontri intimi 100% reali.",
    pl2_title: "Latine da Infarto",
    pl2_desc: "Una selezione bollente con la migliore passione e curve latine.",
    pl3_title: "Amatoriali d'Elite",
    pl3_desc: "Volti nuovi e talenti indipendenti scelti dalla community.",
  },
  pt: {
    sectionTitle: "🏆 Playlists Populares da Comunidade",
    sectionDesc: "Coleções quentes recomendadas pelos usuários.",
    playAll: "Reproduzir Tudo",
    likes: "curtidas",
    videosCount: "{count} vídeos",
    pl1_title: "O Melhor do Casero de 2026",
    pl1_desc: "As melhores gravações amadoras e encontros íntimos reais.",
    pl2_title: "Latinas de Tirar o Fôlego",
    pl2_desc: "Uma seleção ardente com a melhor paixão e curvas latinas.",
    pl3_title: "Amador de Elite",
    pl3_desc: "Novos rostos e talentos independentes recomendados.",
  },
  sl: {
    sectionTitle: "🏆 Priljubljeni seznami predvajanja skupnosti",
    sectionDesc: "Vroče zbirke, ki jih priporoča skupnost Zintia Vids.",
    playAll: "Predvajaj vse",
    likes: "všečkov",
    videosCount: "{count} videoposnetkov",
    pl1_title: "Najboljše domače leta 2026",
    pl1_desc: "Najboljši amaterski posnetki in 100-odstotno resnična intimna srečanja.",
    pl2_title: "Vroče Latinskoameričanke",
    pl2_desc: "Vroč izbor, ki prikazuje najboljši latinski temperament, strast in obline.",
    pl3_title: "Elitni amaterski talenti",
    pl3_desc: "Sveži obrazi in neodvisni ustvarjalci, ki jih priporoča skupnost.",
  },
};

export function CommunityPlaylists({ videos, lang }: CommunityPlaylistsProps) {
  const activeLang = lang || "es";
  const t = PLAYLISTS_TRANSLATIONS[activeLang] || PLAYLISTS_TRANSLATIONS.es;

  // Curate 3 lists matching categories: caseros, latinas, amateur
  const getCuratedVideos = (category: string) => {
    let filtered = videos.filter((v) => v.category === category);
    if (filtered.length < 4) {
      // fill up to 5 with general videos
      const remaining = videos.filter((v) => v.category !== category).slice(0, 5 - filtered.length);
      filtered = [...filtered, ...remaining];
    }
    return filtered.slice(0, 5);
  };

  const playlistsData = [
    {
      id: "pl_caseros",
      title: t.pl1_title,
      desc: t.pl1_desc,
      icon: Flame,
      likes: "4.8K",
      videos: getCuratedVideos("caseros"),
    },
    {
      id: "pl_latinas",
      title: t.pl2_title,
      desc: t.pl2_desc,
      icon: Award,
      likes: "3.9K",
      videos: getCuratedVideos("latinas"),
    },
    {
      id: "pl_amateur",
      title: t.pl3_title,
      desc: t.pl3_desc,
      icon: Star,
      likes: "5.2K",
      videos: getCuratedVideos("amateur"),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 py-6 border-b border-white/5 font-sans">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm md:text-base font-black text-white tracking-wide uppercase flex items-center gap-2 font-heading">
          {t.sectionTitle}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t.sectionDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {playlistsData.map((pl) => {
          if (pl.videos.length === 0) return null;
          const firstVideo = pl.videos[0];
          const playlistIds = pl.videos.map((v) => v.id).join(",");
          const playUrl = `/video/${slugify(translateTitle(firstVideo.title, activeLang))}-${firstVideo.id}?lang=${activeLang}&playlist=${playlistIds}`;

          return (
            <div
              key={pl.id}
              className="group relative flex flex-col bg-zinc-900/30 border border-white/5 hover:border-rose-500/20 rounded-2xl overflow-hidden p-4.5 transition-all duration-300 hover:scale-[1.02] shadow-xl"
            >
              {/* Stacked Thumbnail Effect */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 mb-3 border border-white/10 group-hover:shadow-[0_4px_20px_rgba(244,63,94,0.15)] transition-all">
                {/* Underlay stack cards */}
                <div className="absolute inset-0 bg-zinc-900 translate-y-1.5 translate-x-1.5 rounded-xl border border-white/5 opacity-50 scale-95" />
                <div className="absolute inset-0 bg-zinc-950 translate-y-1 translate-x-1 rounded-xl border border-white/10 opacity-75 scale-[0.98]" />
                
                {/* Main thumbnail */}
                <div className="relative w-full h-full z-10">
                  <Image
                    src={firstVideo.thumbnailUrl}
                    alt={pl.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={playUrl}
                      className="bg-rose-500 text-white p-3.5 rounded-full shadow-lg shadow-rose-500/30 scale-75 group-hover:scale-100 transition-transform duration-300"
                    >
                      <Play className="w-5 h-5 fill-white" />
                    </Link>
                  </div>
                </div>

                {/* Counters on top of thumbnail */}
                <span className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-sm text-[9px] font-black text-rose-400 px-2.5 py-1 rounded-lg border border-rose-500/10 z-20 uppercase tracking-wider">
                  {t.videosCount.replace("{count}", pl.videos.length.toString())}
                </span>

                <span className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded border border-white/5 z-20 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-rose-500" />
                  <span>{pl.likes} {t.likes}</span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white leading-snug group-hover:text-rose-400 transition-colors uppercase tracking-wide flex items-center gap-1.5">
                    <pl.icon className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{pl.title}</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal line-clamp-2">
                    {pl.desc}
                  </p>
                </div>

                <Link
                  href={playUrl}
                  className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow font-heading cursor-pointer mt-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{t.playAll}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
