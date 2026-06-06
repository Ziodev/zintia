import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import { VideoGrid } from "@/components/cards/VideoGrid";
import { translations, Language } from "@/lib/translations";
import { getVideos } from "@/lib/feed";
import { notFound } from "next/navigation";

// Supported categories validation
const VALID_CATEGORIES = ["amateur", "anal", "milf", "caseros", "latinas", "ebony", "webcams"];

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

const CATEGORY_NAMES: Record<string, Record<Language, string>> = {
  amateur: { es: "Amateur", en: "Amateur", fr: "Amateur", ja: "アマチュア", it: "Amatoriale", pt: "Amador" },
  anal: { es: "Anal", en: "Anal", fr: "Anal", ja: "アナル", it: "Anale", pt: "Anal" },
  milf: { es: "Maduras / MILF", en: "MILF / Mature", fr: "Matures", ja: "熟女", it: "Mature", pt: "Maduras" },
  caseros: { es: "Caseros / Caseras", en: "Homemade", fr: "Fait Maison", ja: "自家製", it: "Amatoriali", pt: "Caseiros" },
  latinas: { es: "Latinas", en: "Latinas", fr: "Latines", ja: "ラテン", it: "Latine", pt: "Latinas" },
  ebony: { es: "Negras / Ebony", en: "Ebony", fr: "Ébène", ja: "黒人", it: "Ebano", pt: "Negras" },
  webcams: { es: "Webcams en Vivo", en: "Live Webcams", fr: "Webcams en Direct", ja: "ライブチャット", it: "Webcam dal Vivo", pt: "Webcams ao Vivo" }
};

const CATEGORY_DESCRIPTIONS: Record<string, Record<Language, string>> = {
  amateur: {
    es: "Explora los mejores videos amateur gratis en alta definición. Contenido casero, real y de parejas aficionadas.",
    en: "Explore the best free amateur videos in high definition. Homemade, real and amateur couple content.",
    fr: "Explorez les meilleures vidéos amateurs gratuites en haute définition. Contenu fait maison et réel.",
    ja: "高画質の最高の無料アマチュア動画をご覧ください。自家製、リアル、素人カップルのコンテンツ。",
    it: "Esplora i migliori video amatoriali gratis in alta definizione. Contenuto casalingo e reale.",
    pt: "Explore os melhores vídeos amadores gratuitos em alta definição. Conteúdo caseiro e real."
  },
  anal: {
    es: "Los videos de sexo anal más populares en calidad HD sin interrupciones. Disfruta de la mejor colección gratis.",
    en: "The most popular anal sex videos in HD quality without buffering. Enjoy the best free collection.",
    fr: "Les vidéos de sodomie les plus populaires en qualité HD sans interruption. Profitez de la meilleure collection gratuite.",
    ja: "バッファリングなしの高画質アナル動画。最高の無料コレクションをお楽しみください。",
    it: "I video di sesso anale più popolari in qualità HD senza buffering. Goditi la migliore collezione gratuita.",
    pt: "Os vídeos de sexo anal mais populares em qualidade HD sem interrupções. Desfrute da melhor coleção gratuita."
  },
  milf: {
    es: "Videos gratis de maduras, señoras y MILFs ardientes en alta definición. El mejor contenido de maduras online.",
    en: "Free videos of hot MILFs and mature women in high definition. The best mature content online.",
    fr: "Vidéos gratuites de MILF et de femmes matures en haute définition. Le meilleur contenu mature en ligne.",
    ja: "高画質のホットな熟女や人妻の無料動画。オンラインで最高の熟女コンテンツ。",
    it: "Video gratuiti di MILF calde e donne mature in alta definizione. Il mejor contenuto maturo online.",
    pt: "Vídeos gratuitos de MILFs quentes e mulheres maduras em alta definição. O melhor conteúdo de coroas online."
  },
  caseros: {
    es: "Videos caseros reales grabados por parejas aficionadas en su intimidad. Acción real sin cortes en calidad HD.",
    en: "Real homemade videos recorded by amateur couples in intimacy. Real uncut action in HD quality.",
    fr: "De vraies vidéos maison enregistrées par des couples amateurs dans l'intimité. De la vraie action non coupée en HD.",
    ja: "親密な関係の素人カップルによって録画された本物の自家製動画。HD画質のリアルなノーカットアクション。",
    it: "Veri video fatti in casa registrati da coppie amatoriali nell'intimità. Vera azione non tagliata in qualità HD.",
    pt: "Vídeos caseiros reais gravados por casais amadores na intimidade. Ação real sem cortes em qualidade HD."
  },
  latinas: {
    es: "Disfruta de ardientes videos de latinas gratis. Contenido de modelos de Colombia, Brasil, México y más en HD.",
    en: "Enjoy hot Latina videos for free. HD content from models in Colombia, Brazil, Mexico and more.",
    fr: "Profitez de vidéos de latinas chaudes gratuitement. Contenu HD de modèles de Colombie, Brésil, Mexique et plus.",
    ja: "ホットなラテン系の無料動画をお楽しみください。コロンビア、ブラジル、メキシコなどのモデルのHDコンテンツ。",
    it: "Goditi video di latine calde gratis. Contenuto HD di modelle provenienti da Colombia, Brasile, Messico e altro.",
    pt: "Desfrute de vídeos de latinas quentes gratuitamente. Conteúdo HD de modelos da Colômbia, Brasil, México e muito más."
  },
  ebony: {
    es: "La mejor colección de videos de negras y ebony gratis en alta definición. Disfruta de la mejor calidad premium.",
    en: "The best collection of free black and ebony videos in high definition. Enjoy the best premium quality.",
    fr: "La meilleure collection de vidéos de femmes noires et ébène gratuites en haute définition. Qualité premium.",
    ja: "高画質の黒人とエボニーの無料動画の最高のコレクション。最高のプレミアム品質をお楽しみください。",
    it: "La migliore collezione di video di nere ed ebano gratis in alta definizione. Goditi la migliore qualità premium.",
    pt: "A melhor coleção de vídeos de negras e ebony gratuitos em alta definição. Desfrute da melhor qualidade premium."
  },
  webcams: {
    es: "Accede a las mejores salas de webcams premium en vivo gratis. Chat en directo con miles de modelos online.",
    en: "Access the best premium live webcam rooms for free. Live chat with thousands of models online.",
    fr: "Accédez gratuitement aux meilleurs salons de webcams en direct premium. Chat en direct avec des modèles.",
    ja: "最高のプレミアムライブチャットルームに無料でアクセス。何千人ものモデルとのライブチャット。",
    it: "Accedi gratuitamente alle migliori stanze di webcam dal vivo premium. Chat dal vivo con modelle online.",
    pt: "Aceda às melhores salas de webcams premium ao vivo gratuitamente. Chat ao vivo com modelos online."
  }
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  if (!VALID_CATEGORIES.includes(id)) {
    return { title: "Categoría no encontrada - Zintia Vids" };
  }

  const catName = CATEGORY_NAMES[id]?.[activeLang] || id;
  const catDesc = CATEGORY_DESCRIPTIONS[id]?.[activeLang] || "";

  const title = `Videos de Categoría ${catName} Gratis HD | Zintia Vids`;
  const description = `${catDesc} Streaming de alto rendimiento sin interrupciones.`;

  return {
    title,
    description,
    robots: "index, follow",
    alternates: {
      canonical: activeLang === "es" ? `/category/${id}` : `/category/${id}?lang=${activeLang}`,
      languages: {
        es: `/category/${id}?lang=es`,
        en: `/category/${id}?lang=en`,
        fr: `/category/${id}?lang=fr`,
        ja: `/category/${id}?lang=ja`,
        it: `/category/${id}?lang=it`,
        pt: `/category/${id}?lang=pt`,
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

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  if (!VALID_CATEGORIES.includes(id)) {
    notFound();
  }

  const t = translations[activeLang] || translations.es;
  const videos = await getVideos();
  const catName = CATEGORY_NAMES[id]?.[activeLang] || id;

  return (
    <div className="flex flex-col gap-6 py-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          {t.categories}: {catName}
          <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-rose-500/20">
            HD
          </span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground font-sans">
          {CATEGORY_DESCRIPTIONS[id]?.[activeLang] || ""}
        </p>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <CategoryFilter videos={videos} />
        <VideoGrid initialVideos={videos} />
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
