import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import { VideoGrid } from "@/components/cards/VideoGrid";
import { translations, Language } from "@/lib/translations";
import { getVideos } from "@/lib/feed";
import { notFound } from "next/navigation";
import { TAG_LABELS } from "@/components/filters/TagCloud";

// Supported categories validation
const VALID_CATEGORIES = ["amateur", "anal", "milf", "caseros", "latinas", "ebony", "webcams"];

interface PageProps {
  params: Promise<{ id: string; tag: string }>;
  searchParams: Promise<{ lang?: string }>;
}

const CATEGORY_NAMES: Record<string, Record<Language, string>> = {
  amateur: { es: "Amateur", en: "Amateur", fr: "Amateur", ja: "アマチュア", it: "Amatoriale", pt: "Amador", sl: "Amaterski", da: "Amatør" },
  anal: { es: "Anal", en: "Anal", fr: "Anal", ja: "アナル", it: "Anale", pt: "Anal", sl: "Analni", da: "Anal" },
  milf: { es: "Maduras / MILF", en: "MILF / Mature", fr: "Matures", ja: "熟女", it: "Mature", pt: "Maduras", sl: "Zrele / MILF", da: "MILFs" },
  caseros: { es: "Caseros / Caseras", en: "Homemade", fr: "Fait Maison", ja: "自家製", it: "Amatoriali", pt: "Caseiros", sl: "Domači posnetki", da: "Hjemmelavet" },
  latinas: { es: "Latinas", en: "Latinas", fr: "Latines", ja: "ラテン", it: "Latine", pt: "Latinas", sl: "Latino", da: "Latinaer" },
  ebony: { es: "Negras / Ebony", en: "Ebony", fr: "Ébène", ja: "黒人", it: "Ebano", pt: "Negras", sl: "Temnopolte", da: "Mørke" },
  webcams: { es: "Webcams en Vivo", en: "Live Webcams", fr: "Webcams en Direct", ja: "ライブチャット", it: "Webcam dal Vivo", pt: "Webcams ao Vivo", sl: "Spletne kamere v živo", da: "Webcams" }
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id, tag } = await params;
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  if (!VALID_CATEGORIES.includes(id)) {
    return { title: "Categoría no encontrada - Zintia Vids" };
  }

  const catName = CATEGORY_NAMES[id]?.[activeLang] || id;
  
  const getLabel = (t: string) => {
    const labels = TAG_LABELS[t];
    if (labels) return labels[activeLang] || labels.en || t;
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const tagName = getLabel(tag);

  const titles: Record<Language, string> = {
    es: `Videos de ${catName} ${tagName} HD | Zintia Vids`,
    en: `${catName} ${tagName} Videos HD | Zintia Vids`,
    fr: `Vidéos de ${catName} ${tagName} HD | Zintia Vids`,
    ja: `${catName} ${tagName} 動画 HD | Zintia Vids`,
    it: `Video di ${catName} ${tagName} HD | Zintia Vids`,
    pt: `Vídeos de ${catName} ${tagName} HD | Zintia Vids`,
    sl: `Videoposnetki ${catName} ${tagName} HD | Zintia Vids`,
    da: `${catName} ${tagName} videoer HD | Zintia Vids`,
  };

  const descriptions: Record<Language, string> = {
    es: `Explora los mejores videos de ${catName} con la etiqueta #${tagName} en alta definición. Streaming rápido y sin interrupciones.`,
    en: `Explore the best ${catName} videos tagged with #${tagName} in high definition. Fast and smooth streaming.`,
    fr: `Découvrez les meilleures vidéos de ${catName} avec le tag #${tagName} en haute définition. Lecture fluide.`,
    ja: `Zintia Vidsで#${tagName}タグの付いた最高の${catName}動画をチェック。`,
    it: `Esplora i migliori video di ${catName} con il tag #${tagName} in alta definizione. Streaming fluido.`,
    pt: `Explore os melhores vídeos de ${catName} com a tag #${tagName} em alta definição. Transmissão fluida.`,
    sl: `Raziščite najboljše videoposnetke ${catName} z oznako #${tagName} v visoki ločljivosti. Hitro predvajanje.`,
    da: `Udforsk de bedste ${catName} videoer mærket med #${tagName} i høj opløsning. Hurtig streaming.`,
  };

  const title = titles[activeLang] || titles.es;
  const description = descriptions[activeLang] || descriptions.es;

  return {
    title,
    description,
    keywords: [
      `${catName} ${tagName}`, 
      `videos de ${catName} ${tagName}`, 
      `porno ${catName} ${tagName}`, 
      `${catName} ${tagName} hd`, 
      `${catName} amateur ${tagName}`,
      "hd", 
      "zintia vids"
    ],
    robots: "index, follow",
    alternates: {
      canonical: activeLang === "es" ? `/category/${id}/${tag}` : `/category/${id}/${tag}?lang=${activeLang}`,
      languages: {
        es: `/category/${id}/${tag}?lang=es`,
        en: `/category/${id}/${tag}?lang=en`,
        fr: `/category/${id}/${tag}?lang=fr`,
        ja: `/category/${id}/${tag}?lang=ja`,
        it: `/category/${id}/${tag}?lang=it`,
        pt: `/category/${id}/${tag}?lang=pt`,
        sl: `/category/${id}/${tag}?lang=sl`,
        da: `/category/${id}/${tag}?lang=da`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default async function CategoryTagPage({ params, searchParams }: PageProps) {
  const { id, tag } = await params;
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  if (!VALID_CATEGORIES.includes(id)) {
    notFound();
  }

  const videos = await getVideos();
  
  // Validate if this combination actually has videos
  const combinationExists = videos.some((v) => v.category === id && v.tags?.includes(tag));
  if (!combinationExists) {
    notFound();
  }

  const t = translations[activeLang] || translations.es;
  const catName = CATEGORY_NAMES[id]?.[activeLang] || id;

  const getLabel = (t: string) => {
    const labels = TAG_LABELS[t];
    if (labels) return labels[activeLang] || labels.en || t;
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const tagName = getLabel(tag);

  return (
    <div className="flex flex-col gap-6 py-6 animate-fade-in font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 font-heading">
          {t.categories}: {catName} <span className="text-rose-500">|</span> #{tagName}
          <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-rose-500/20 uppercase leading-none">
            HD
          </span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Explora los mejores videos de {catName} con la etiqueta {tagName} en alta definición.
        </p>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <CategoryFilter videos={videos} forcedCategory={id} forcedTag={tag} />
        <VideoGrid initialVideos={videos} forcedCategory={id} forcedTag={tag} />
      </Suspense>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 py-4">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full shrink-0 bg-zinc-900 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-video w-full rounded-2xl bg-zinc-900 animate-pulse" />
            <div className="h-3.5 w-[85%] rounded bg-zinc-900 animate-pulse" />
            <div className="h-2.5 w-[50%] rounded bg-zinc-900 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
