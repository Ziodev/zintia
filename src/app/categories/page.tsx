import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { prisma } from "@/lib/prisma";
import { DRTUBER_FALLBACK_VIDEOS } from "@/lib/drtuber_fallback";
import { translations, Language } from "@/lib/translations";
import { TAG_LABELS } from "@/components/filters/TagCloud";

const VALID_CATEGORIES = ["amateur", "anal", "milf", "caseros", "latinas", "ebony", "webcams"];

const CATEGORY_NAMES: Record<string, Record<Language, string>> = {
  amateur: { es: "Amateur", en: "Amateur", fr: "Amateur", ja: "アマチュア", it: "Amatoriale", pt: "Amador", sl: "Amaterski", da: "Amatør" },
  anal: { es: "Anal", en: "Anal", fr: "Anal", ja: "アナル", it: "Anale", pt: "Anal", sl: "Analni", da: "Anal" },
  milf: { es: "Maduras / MILF", en: "MILF / Mature", fr: "Matures", ja: "熟女", it: "Mature", pt: "Maduras", sl: "Zrele / MILF", da: "MILFs" },
  caseros: { es: "Caseros / Homemade", en: "Homemade", fr: "Fait Maison", ja: "自家製", it: "Amatoriali", pt: "Caseiros", sl: "Domači posnetki", da: "Hjemmelavet" },
  latinas: { es: "Latinas", en: "Latinas", fr: "Latines", ja: "ラテン", it: "Latine", pt: "Latinas", sl: "Latino", da: "Latinaer" },
  ebony: { es: "Negras / Ebony", en: "Ebony", fr: "Ébène", ja: "黒人", it: "Ebano", pt: "Negras", sl: "Temnopolte", da: "Mørke" },
  webcams: { es: "Webcams en Vivo", en: "Live Webcams", fr: "Webcams en Direct", ja: "ライブチャット", it: "Webcam dal Vivo", pt: "Webcams ao Vivo", sl: "Spletne kamere v živo", da: "Webcams" }
};

const CATEGORY_DESCRIPTIONS: Record<string, Record<Language, string>> = {
  amateur: {
    es: "Los mejores videos amateur de parejas reales en alta definición.",
    en: "The best amateur videos from real couples in high definition.",
    fr: "Les meilleures vidéos amateurs de vrais couples en haute définition.",
    ja: "高画質のリアルなカップルのベストアマチュア動画。",
    it: "I migliori video amatoriali di coppie reali in alta definição.",
    pt: "Os melhores vídeos amadores de casais reais em alta definição.",
    sl: "Najboljši amaterski videoposnetki resničnih parov v visoki ločljivosti.",
    da: "De bedste amatørvideoer fra ægte par i høj opløsning."
  },
  anal: {
    es: "La mejor colección de sexo anal en calidad HD sin interrupciones.",
    en: "The best collection of anal sex in HD quality without buffering.",
    fr: "La meilleure collection de sodomie en qualité HD sans interruption.",
    ja: "バッファリングなしの高画質アナル動画のベストコレクション。",
    it: "La migliore collezione di sesso anale in qualidade HD senza buffering.",
    pt: "A melhor coleção de sexo anal em qualidade HD sem interrupções.",
    sl: "Najboljša zbirka analnega seksa v HD kakovosti brez prekinitev.",
    da: "Den bedste samling af analsex i HD-kvalitet uden afbrydelser."
  },
  milf: {
    es: "Maduras ardientes, señoras y MILFs calientes en alta definición.",
    en: "Hot MILFs and mature women in high definition.",
    fr: "Vidéos de MILFs et femmes matures en haute définition.",
    ja: "高画質のホットな熟女や人妻の動画。",
    it: "MILF calde e donne mature in alta definizione.",
    pt: "Coroas gostosas e mulheres maduras em alta definição.",
    sl: "Vroče zrele ženske in MILF v visoki ločljivosti.",
    da: "Lækre MILFs og modne kvinder i høj opløsning."
  },
  caseros: {
    es: "Acción casera real sin cortes gravada en la intimidad de parejas aficionadas.",
    en: "Real uncut homemade action recorded in intimacy by amateur couples.",
    fr: "Action maison réelle non coupée enregistrée par des couples amateurs.",
    ja: "素人カップルの親密な空間で録画されたリアルなノーカット自家製アクション。",
    it: "Vera azione casalinga non tagliata registrata da coppie amatoriali.",
    pt: "Ação caseira real sem cortes gravada na intimidade de casais amadores.",
    sl: "Prava neprekinjena domača akcija, ki so jo v zasebnosti posneli amaterski pari.",
    da: "Ægte usensureret hjemmelavet action optaget i intimitet af amatørpar."
  },
  latinas: {
    es: "Ardientes videos de modelos latinas de Colombia, Brasil, México y más en HD.",
    en: "Hot videos of Latina models from Colombia, Brazil, Mexico and more in HD.",
    fr: "Vidéos chaudes de modèles latines de Colombie, Brésil, Mexique et plus en HD.",
    ja: "コロンビア、ブラジル、メキシコなどのラテン系モデルのホットなHD動画.",
    it: "Video caldi di modelle latine provenienti da Colombia, Brasile, Messico e altro in HD.",
    pt: "Vídeos quentes de modelos latinas da Colômbia, Brasil, México e mais em HD.",
    sl: "Vroči videoposnetki latino modelov iz Kolumbije, Brazilije, Mehike in več v HD.",
    da: "Lækre videoer af latina-modeller fra Colombia, Brasilien, Mexico og mere i HD."
  },
  ebony: {
    es: "Espectacular colección de videos de negras y ebony en alta definición.",
    en: "Spectacular collection of black and ebony videos in high definition.",
    fr: "Spectaculaire collection de vidéos de femmes noires et ébène en HD.",
    ja: "高画質の黒人とエボニーの動画の素晴らしいコレクション。",
    it: "Spettacolare collezione di video di nere ed ebano in alta definizione.",
    pt: "Espetacular coleção de vídeos de negras e ebony em alta definição.",
    sl: "Izjemna zbirka videoposnetkov temnopoltih deklet v visoki ločljivosti.",
    da: "Flot samling af mørke og ebony-videoer i høj opløsning."
  },
  webcams: {
    es: "Salas de webcams en vivo premium. Chat en directo con miles de modelos online.",
    en: "Premium live webcam rooms. Live chat with thousands of models online.",
    fr: "Salons de webcams en direct premium. Chat en direct avec des modèles.",
    ja: "プレミアムライブチャットルーム。何千人ものモデルとのライブチャット。",
    it: "Stanze di webcam dal vivo premium. Chat dal vivo con modelle online.",
    pt: "Salas de webcams ao vivo premium. Chat ao vivo com modelos online.",
    sl: "Premium spletne kamere v živo. Klepet v živo s tisoči modelov na spletu.",
    da: "Premium live webcam-rum. Live chat med tusindvis af modeller online."
  }
};

const getGenericDescription = (name: string, lang: Language) => {
  switch (lang) {
    case "es": return `Explora los mejores videos de ${name} en alta definición.`;
    case "en": return `Explore the best ${name} videos in high definition.`;
    case "fr": return `Explorez les meilleures vidéos de ${name} en haute définition.`;
    case "ja": return `高画質の${name}動画を探索する。`;
    case "it": return `Esplora i migliori video di ${name} in alta definizione.`;
    case "pt": return `Explore os melhores vídeos de ${name} em alta definição.`;
    case "sl": return `Raziščite najboljše videoposnetke ${name} v visoki ločljivosti.`;
    case "da": return `Udforsk de bedste ${name} videoer i høj opløsning.`;
    default: return `Explore the best ${name} videos in high definition.`;
  }
};

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  const titles: Record<Language, string> = {
    es: "Categorías de Videos HD - Explorar Colección | Zintia Vids",
    en: "HD Video Categories - Explore Collection | Zintia Vids",
    fr: "Catégories de Vidéos HD - Explorer | Zintia Vids",
    ja: "高画質動画カテゴリー - コレクションを探索 | Zintia Vids",
    it: "Categorie di Video HD - Esplora Collezione | Zintia Vids",
    pt: "Categorias de Vídeos HD - Explorar Coleção | Zintia Vids",
    sl: "HD video kategorije - raziščite zbirko | Zintia Vids",
    da: "HD Video Kategorier - Udforsk Samling | Zintia Vids"
  };

  const descriptions: Record<Language, string> = {
    es: "Explora todas las categorías de videos premium. Videos amateur, milfs, latinas, webcam y más en alta definición.",
    en: "Explore all premium video categories. Amateur, milfs, latinas, webcam videos and more in high definition.",
    fr: "Explorez toutes les catégories de vidéos. Vidéos amateur, milfs, latines, webcam et plus en HD.",
    ja: "すべてのプレミアム動画カテゴリーをご覧ください。アマチュア、熟女、ラテン系、ライブチャット動画など高画質で配信中。",
    it: "Esplora tutte le categorie di video premium. Video amatoriali, milf, latine, webcam e altro in HD.",
    pt: "Explore todas as categorias de vídeos premium. Vídeos amadores, coroas, latinas, webcam e mais em HD.",
    sl: "Raziščite vse kategorije premium videoposnetkov. Amaterski, zrele, latino, spletne kamere in več v visoki ločljivosti.",
    da: "Udforsk alle premium videokategorier. Amatør, milfs, latinaer, webcamvideoer og mere i høj opløsning."
  };

  const title = titles[activeLang] || titles.es;
  const description = descriptions[activeLang] || descriptions.es;

  return {
    title,
    description,
    robots: "index, follow",
    alternates: {
      canonical: activeLang === "es" ? "/categories" : `/categories?lang=${activeLang}`,
      languages: {
        es: "/categories?lang=es",
        en: "/categories?lang=en",
        fr: "/categories?lang=fr",
        ja: "/categories?lang=ja",
        it: "/categories?lang=it",
        pt: "/categories?lang=pt",
        sl: "/categories?lang=sl",
        da: "/categories?lang=da",
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

export default async function CategoriesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // Retrieve one video preview for each category in parallel
  const allCategories = Object.keys(TAG_LABELS);
  const categoriesData = await Promise.all(
    allCategories.map(async (catId) => {
      const isCore = VALID_CATEGORIES.includes(catId);
      // Query the latest published video in this category
      let video = await prisma.video.findFirst({
        where: isCore ? { category: catId, status: "PUBLISHED" } : { tags: { has: catId }, status: "PUBLISHED" },
        orderBy: { published_at: "desc" },
      });

      // Fallback if no video in DB
      if (!video) {
        const fallback = DRTUBER_FALLBACK_VIDEOS.find((v) => v.category === catId);
        if (fallback) {
          video = {
            id: fallback.id,
            title: fallback.title,
            duration: fallback.duration,
            views: fallback.views,
            category: fallback.category,
            tags: fallback.tags,
            thumbnailUrl: fallback.thumbnailUrl,
            videoPreviewUrl: fallback.videoPreviewUrl,
            embedUrl: fallback.embedUrl || null,
            status: "PUBLISHED",
            published_at: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
      }

      const name = TAG_LABELS[catId]?.[activeLang] || TAG_LABELS[catId]?.en || catId;
      const description = CATEGORY_DESCRIPTIONS[catId]?.[activeLang] || getGenericDescription(name, activeLang);

      return {
        id: catId,
        name,
        description,
        thumbnailUrl: video?.thumbnailUrl || "https://pics.drtuber.com/media/videos/tmb/10091385/preview/12.jpg",
        videoPreviewUrl: video?.videoPreviewUrl || null,
        isCore,
      };
    })
  );

  return (
    <div className="flex flex-col gap-6 py-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          {t.categories}
          <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-rose-500/20">
            {activeLang === "es" ? "Explorar" : activeLang === "ja" ? "探索" : "Explore"}
          </span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground font-sans">
          {activeLang === "es"
            ? "Pasa el cursor sobre una categoría para ver una vista previa interactiva del contenido."
            : activeLang === "ja"
            ? "カテゴリーの上にカーソルを置くと、コンテンツのインタラクティブなプレビューが表示されます。"
            : "Hover over a category to see an interactive preview of the content."}
        </p>
      </div>

      {/* Grid of Categories */}
      <Suspense fallback={<GridSkeleton />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriesData.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              name={cat.name}
              description={cat.description}
              thumbnailUrl={cat.thumbnailUrl}
              videoPreviewUrl={cat.videoPreviewUrl}
              lang={activeLang}
              type={cat.isCore ? "category" : "tag"}
            />
          ))}
        </div>
      </Suspense>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="aspect-[16/10] w-full rounded-2xl bg-zinc-900 animate-pulse flex flex-col justify-end p-4 gap-2">
          <div className="h-4 w-1/3 rounded bg-zinc-800" />
          <div className="h-3 w-3/4 rounded bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}
