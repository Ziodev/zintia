import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Clock, ThumbsUp, Share2, Tag, ChevronLeft } from "lucide-react";
import { MOCK_VIDEOS, MOCK_ADS } from "@/lib/data";
import { VideoCard } from "@/components/cards/VideoCard";
import { NativeAdCard } from "@/components/cards/NativeAdCard";
import { translations, Language } from "@/lib/translations";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const activeLang = (resolvedSearchParams.lang as Language) || "es";
  const t = translations[activeLang] || translations.es;
  const video = MOCK_VIDEOS.find((v) => v.id === id);
  
  if (!video) {
    return {
      title: `${activeLang === "es" ? "Video no encontrado" : activeLang === "en" ? "Video not found" : "Vidéo non trouvée"} - Zintia Vids`,
    };
  }

  return {
    title: `${video.title} - Zintia Vids`,
    description: `Mira ${video.title} en Zintia Vids. Autoplay inteligente y reproducción fluida.`,
  };
}

export default async function VideoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const activeLang = (resolvedSearchParams.lang as Language) || "es";
  const t = translations[activeLang] || translations.es;
  
  const video = MOCK_VIDEOS.find((v) => v.id === id);

  if (!video) {
    notFound();
  }

  const recommendations = MOCK_VIDEOS.filter((v) => v.id !== id).slice(0, 4);

  return (
    <div className="py-6 flex flex-col gap-6">
      {/* Back to Home */}
      <div>
        <Link
          href={`/?lang=${activeLang}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-white transition-colors bg-secondary/80 border border-white/5 rounded-full px-4.5 py-2 hover:bg-zinc-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t.backToHome}</span>
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Player & Details */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <video
              src={video.videoPreviewUrl}
              poster={video.thumbnailUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-3.5 p-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
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

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs font-semibold bg-secondary/80 border border-white/5 px-4.5 py-2 rounded-full hover:bg-zinc-800 transition-colors text-white active:scale-95">
                  <ThumbsUp className="w-3.5 h-3.5" /> <span>{t.like}</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold bg-secondary/80 border border-white/5 px-4.5 py-2 rounded-full hover:bg-zinc-800 transition-colors text-white active:scale-95">
                  <Share2 className="w-3.5 h-3.5" /> <span>{t.share}</span>
                </button>
              </div>
            </div>

            <div className="text-xs md:text-sm text-muted-foreground leading-relaxed bg-zinc-900/35 border border-white/5 rounded-2xl p-4.5">
              <p className="font-semibold text-white mb-2">{t.videoDetails}</p>
              Disfruta de la mejor calidad premium en alta definición con tiempos de carga instantáneos e interfaz minimalista. Reproductor responsivo integrado y optimización de tráfico para streaming fluido.
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations & Native Ads */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase border-b border-white/5 pb-2.5">
            {t.nextRecs}
          </h2>

          <div className="flex flex-col gap-3">
            {MOCK_ADS[0] && (
              <NativeAdCard
                title={MOCK_ADS[0].title}
                ctaText={MOCK_ADS[0].ctaText}
                affiliateUrl={MOCK_ADS[0].affiliateUrl}
                thumbnailUrl={MOCK_ADS[0].thumbnailUrl}
                videoPreviewUrl={MOCK_ADS[0].videoPreviewUrl}
              />
            )}

            {recommendations.map((rec) => (
              <VideoCard
                key={rec.id}
                id={rec.id}
                title={rec.title}
                duration={rec.duration}
                views={rec.views}
                thumbnailUrl={rec.thumbnailUrl}
                videoPreviewUrl={rec.videoPreviewUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
