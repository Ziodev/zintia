import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Clock, ThumbsUp, Share2, Tag, ChevronLeft } from "lucide-react";
import { MOCK_ADS } from "@/lib/data";
import { VideoCard } from "@/components/cards/VideoCard";
import { NativeAdCard } from "@/components/cards/NativeAdCard";
import { translations, Language } from "@/lib/translations";
import { getVideos } from "@/lib/feed";
import { TAG_LABELS } from "@/components/filters/TagCloud";
import { LiveCamsWidget } from "@/components/widgets/LiveCamsWidget";
import { VideoDetailsPanel } from "@/components/widgets/VideoDetailsPanel";
import { translateTitle } from "@/lib/auto-tagger";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const activeLang = (resolvedSearchParams.lang as Language) || "es";
  const videos = await getVideos();
  const video = videos.find((v) => v.id === id);
  
  if (!video) {
    return {
      title: `${activeLang === "es" ? "Video no encontrado" : activeLang === "en" ? "Video not found" : "Vidéo non trouvée"} - Zintia Vids`,
    };
  }

  const translatedTitle = translateTitle(video.title, activeLang);

  const descriptions: Record<Language, string> = {
    es: `Mira "${translatedTitle}" en la categoría "${video.category}". Disfruta de reproducción automática inteligente y transmisión fluida.`,
    en: `Watch "${translatedTitle}" in the "${video.category}" category. Enjoy smart autoplay and smooth streaming.`,
    fr: `Regardez "${translatedTitle}" dans la catégorie "${video.category}". Profitez de la lecture automatique intelligente et du streaming fluide.`,
    ja: `「${video.category}」カテゴリの「${translatedTitle}」をご覧いただけます。スマート自動再生とスムーズな再生に対応。`,
    it: `Guarda "${translatedTitle}" nella categoria "${video.category}". Goditi l'autoplay inteligente e la riproduzione fluida.`,
    pt: `Assista a "${translatedTitle}" na categoria "${video.category}". Desfrute de reprodução automática inteligente y streaming fluído.`,
  };

  const t = translations[activeLang] || translations.es;
  const title = `${translatedTitle} - ${t.seo_title_suffix} | Zintia Vids`;
  const description = descriptions[activeLang] || descriptions.es;

  return {
    title,
    description,
    robots: "index, follow",
    alternates: {
      canonical: activeLang === "es" ? `/video/${id}` : `/video/${id}?lang=${activeLang}`,
      languages: {
        es: `/video/${id}?lang=es`,
        en: `/video/${id}?lang=en`,
        fr: `/video/${id}?lang=fr`,
        ja: `/video/${id}?lang=ja`,
        it: `/video/${id}?lang=it`,
        pt: `/video/${id}?lang=pt`,
      },
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: video.thumbnailUrl,
          width: 1200,
          height: 630,
          alt: translatedTitle,
        },
      ],
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [video.thumbnailUrl],
    },
  };
}

function formatDurationISO(durationStr: string): string {
  const parts = durationStr.split(":");
  if (parts.length === 2) {
    const min = parseInt(parts[0], 10);
    const sec = parseInt(parts[1], 10);
    return `PT${min}M${sec}S`;
  }
  return "PT10M0S";
}

export default async function VideoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const activeLang = (resolvedSearchParams.lang as Language) || "es";
  const t = translations[activeLang] || translations.es;
  
  const videos = await getVideos();
  const video = videos.find((v) => v.id === id);

  if (!video) {
    notFound();
  }

  const recommendations = videos.filter((v) => v.id !== id).slice(0, 4);

  const rightRecIds = new Set(recommendations.map((v) => v.id));
  let categoryRelated = videos.filter(
    (v) => v.id !== id && !rightRecIds.has(v.id) && v.category === video.category
  );
  if (categoryRelated.length < 4) {
    const extraRelated = videos.filter(
      (v) => v.id !== id && !rightRecIds.has(v.id) && v.category !== video.category
    );
    categoryRelated = [...categoryRelated, ...extraRelated];
  }
  const relatedVideos = categoryRelated.slice(0, 4);

  // Dynamically assign unique assets from the end of the loaded video list to prevent repetition
  const sourceVideoForAd = videos[videos.length - 1] || video;
  const dynamicAd = MOCK_ADS[0] ? {
    ...MOCK_ADS[0],
    thumbnailUrl: sourceVideoForAd.thumbnailUrl,
    videoPreviewUrl: sourceVideoForAd.videoPreviewUrl,
  } : null;

  const translatedTitle = translateTitle(video.title, activeLang);

  const localizedDescriptions: Record<Language, string> = {
    es: `Mira el video "${translatedTitle}" en la categoría "${video.category}". Este video tiene una duración de ${video.duration} y cuenta con más de ${video.views} vistas. Disfruta de una reproducción fluida, rápida y en alta definición.`,
    en: `Watch "${translatedTitle}" in the "${video.category}" category. This video is ${video.duration} long with over ${video.views} views. Enjoy smooth, fast, and high-definition playback.`,
    fr: `Regardez "${translatedTitle}" dans la catégorie "${video.category}". Cette vidéo dure ${video.duration} avec plus de ${video.views} vues. Profitez d'une lecture fluide, rapide et en haute definição.`,
    ja: `「${video.category}」カテゴリー of 「${translatedTitle}」をご覧ください。この動画的の長さは ${video.duration} で、${video.views}回以上視聴されています。スムーズで高速なHD再生をお楽しみください。`,
    it: `Guarda "${translatedTitle}" nella categoria "${video.category}". Questo video dura ${video.duration} con oltre ${video.views} visualizzazioni. Goditi una riproduzione fluida, veloce e in alta definizione.`,
    pt: `Assista a "${translatedTitle}" na categoria "${video.category}". Este vídeo tem a duração de ${video.duration} com mais de ${video.views} visualizações. Desfrute de uma reprodução fluida, rápida e em alta definição.`,
  };
  const videoDescription = localizedDescriptions[activeLang] || localizedDescriptions.es;

  const getTagLabel = (tag: string) => {
    const labels = TAG_LABELS[tag];
    if (labels) return labels[activeLang] || labels.en || tag;
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  return (
    <div className="py-6 flex flex-col gap-6 font-sans">
      {/* JSON-LD VideoObject Schema for Google Rich Search Previews */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": translatedTitle,
            "description": videoDescription,
            "thumbnailUrl": video.thumbnailUrl,
            "uploadDate": "2026-06-06T00:00:00Z",
            "duration": formatDurationISO(video.duration),
            "embedUrl": video.embedUrl || video.videoPreviewUrl,
            "keywords": video.tags?.join(", ") || "",
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": { "@type": "WatchAction" },
              "userInteractionCount": parseInt(video.views.replace(/\D/g, "")) * 1000,
            },
          }),
        }}
      />
      {/* BreadcrumbList Schema — site hierarchy for search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com",
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": video.category.charAt(0).toUpperCase() + video.category.slice(1),
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com"}/?category=${video.category}`,
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": translatedTitle,
              },
            ],
          }),
        }}
      />
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
            {video.embedUrl ? (
              <iframe
                src={video.embedUrl}
                allowFullScreen
                allow="autoplay; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={video.videoPreviewUrl}
                poster={video.thumbnailUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <VideoDetailsPanel video={video} activeLang={activeLang} t={t} />

            <div className="text-xs md:text-sm text-muted-foreground leading-relaxed bg-zinc-900/35 border border-white/5 rounded-2xl p-4.5">
              <p className="font-semibold text-white mb-2">{t.videoDetails}</p>
              <p className="mb-4">{videoDescription}</p>

              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                  {video.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/?tag=${tag}&lang=${activeLang}`}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-muted-foreground border border-white/5 transition-all cursor-pointer"
                    >
                      #{getTagLabel(tag)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <LiveCamsWidget currentVideo={video} allVideos={videos} />

            {/* Related Videos Section */}
            <div className="w-full flex flex-col gap-4 mt-6">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase border-b border-white/5 pb-2.5">
                {t.related_videos_title}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {relatedVideos.map((rec) => (
                  <VideoCard
                    key={rec.id}
                    id={rec.id}
                    title={rec.title}
                    duration={rec.duration}
                    views={rec.views}
                    thumbnailUrl={rec.thumbnailUrl}
                    videoPreviewUrl={rec.videoPreviewUrl}
                    tags={rec.tags}
                  />
                ))}
              </div>
            </div>
          </div>

        {/* Right Column: Recommendations & Native Ads */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase border-b border-white/5 pb-2.5">
            {t.nextRecs}
          </h2>

          <div className="flex flex-col gap-3">
            {dynamicAd && (
              <NativeAdCard
                title={dynamicAd.title}
                ctaText={dynamicAd.ctaText}
                affiliateUrl={dynamicAd.affiliateUrl}
                thumbnailUrl={dynamicAd.thumbnailUrl}
                videoPreviewUrl={dynamicAd.videoPreviewUrl}
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
                tags={rec.tags}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
