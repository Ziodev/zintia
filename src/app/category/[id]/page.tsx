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
  amateur: { es: "Amateur", en: "Amateur", fr: "Amateur", ja: "アマチュア", it: "Amatoriale", pt: "Amador", sl: "Amaterski", da: "Amatør" },
  anal: { es: "Anal", en: "Anal", fr: "Anal", ja: "アナル", it: "Anale", pt: "Anal", sl: "Analni", da: "Anal" },
  milf: { es: "Maduras / MILF", en: "MILF / Mature", fr: "Matures", ja: "熟女", it: "Mature", pt: "Maduras", sl: "Zrele / MILF", da: "MILFs" },
  caseros: { es: "Caseros / Caseras", en: "Homemade", fr: "Fait Maison", ja: "自家製", it: "Amatoriali", pt: "Caseiros", sl: "Domači posnetki", da: "Hjemmelavet" },
  latinas: { es: "Latinas", en: "Latinas", fr: "Latines", ja: "ラテン", it: "Latine", pt: "Latinas", sl: "Latino", da: "Latinaer" },
  ebony: { es: "Negras / Ebony", en: "Ebony", fr: "Ébène", ja: "黒人", it: "Ebano", pt: "Negras", sl: "Temnopolte", da: "Mørke" },
  webcams: { es: "Webcams en Vivo", en: "Live Webcams", fr: "Webcams en Direct", ja: "ライブチャット", it: "Webcam dal Vivo", pt: "Webcams ao Vivo", sl: "Spletne kamere v živo", da: "Webcams" }
};

const CATEGORY_DESCRIPTIONS: Record<string, Record<Language, string>> = {
  amateur: {
    es: "Explora los mejores videos amateur en alta definición. Contenido casero, real y de parejas aficionadas.",
    en: "Explore the best amateur videos in high definition. Homemade, real and amateur couple content.",
    fr: "Explorez les meilleures vidéos amateurs en haute définition. Contenu fait maison et réel.",
    ja: "高画質のベストアマチュア動画をご覧ください。自家製、リアル、素人カップルのコンテンツ。",
    it: "Esplora i migliori video amatoriali in alta definizione. Contenuto casalingo e reale.",
    pt: "Explore os melhores vídeos amadores em alta definição. Conteúdo caseiro e real.",
    sl: "Raziščite najboljše amaterske videoposnetke v visoki ločljivosti. Domače, resnične vsebine in vsebine amaterskih parov.",
    da: "Udforsk de bedste amatørvideoer i høj opløsning. Hjemmelavet, ægte og amatørpar indhold."
  },
  anal: {
    es: "Los videos de sexo anal más populares en calidad HD sin interrupciones. Disfruta de la mejor colección online.",
    en: "The most popular anal sex videos in HD quality without buffering. Enjoy the best collection.",
    fr: "Les vidéos de sodomie les plus populaires en qualité HD sans interruption. Profitez de la meilleure collection.",
    ja: "バッファリングなしの高画質アナル動画。最高のコレクションをお楽しみください。",
    it: "I video di sesso anale più popolari in qualità HD senza buffering. Goditi la migliore collezione.",
    pt: "Os vídeos de sexo anal mais populares em qualidade HD sem interrupções. Desfrute da melhor coleção.",
    sl: "Najbolj priljubljeni videoposnetki analnega seksa v HD kakovosti brez prekinitev. Uživajte v najboljši zbirki na spletu.",
    da: "De mest populære analsexvideoer i HD-kvalitet uden afbrydelser. Udforsk den bedste samling online."
  },
  milf: {
    es: "Videos de maduras, señoras y MILFs ardientes en alta definición. El mejor contenido de maduras online.",
    en: "Videos of hot MILFs and mature women in high definition. The best mature content online.",
    fr: "Vidéos de MILF et de femmes matures en haute définition. Le meilleur contenu mature en ligne.",
    ja: "高画質のホットな熟女や人妻の動画。オンラインで最高の熟女コンテンツ。",
    it: "Video di MILF calde e donne mature in alta definizione. Il miglior contenuto maturo online.",
    pt: "Vídeos de MILFs quentes e mulheres maduras em alta definição. O melhor conteúdo de coroas online.",
    sl: "Videoposnetki vročih zrelih žensk in MILF v visoki ločljivosti. Najboljša vsebina z zrelimi ženskami na spletu.",
    da: "Videoer af frække MILFs og modne kvinder i høj opløsning. Det bedste modne indhold online."
  },
  caseros: {
    es: "Videos caseros reales grabados por parejas aficionadas en su intimidad. Acción real sin cortes en calidad HD.",
    en: "Real homemade videos recorded by amateur couples in intimacy. Real uncut action in HD quality.",
    fr: "De vraies vidéos maison enregistrées par des couples amateurs dans l'intimité. De la vraie action non coupée en HD.",
    ja: "親密な関係の素人カップルによって録画された本物の自家製動画。HD画質のリアルなノーカットアクション。",
    it: "Veri video fatti in casa registrati da coppie amatoriali nell'intimità. Vera azione non tagliata in qualità HD.",
    pt: "Vídeos caseiros reais gravados por casais amadores na intimidade. Ação real sem cortes em qualidade HD.",
    sl: "Resnični domači videoposnetki, ki so jih amaterski pari posneli v svoji zasebnosti. Resnična neprekinjena akcija v HD kakovosti.",
    da: "Ægte hjemmelavede videoer optaget af amatørpar i intimitet. Rigtig usensureret action i HD-kvalitet."
  },
  latinas: {
    es: "Disfruta de ardientes videos de latinas en alta definición. Contenido de modelos de Colombia, Brasil, México y más en HD.",
    en: "Enjoy hot Latina videos in high definition. HD content from models in Colombia, Brazil, Mexico and more.",
    fr: "Profitez de vidéos de latinas chaudes en haute définition. Contenu HD de modèles de Colombie, Brésil, Mexique et plus.",
    ja: "ホットなラテン系の動画をお楽しみください。コロンビア、ブラジル、メキシコなどのモデルのHDコンテンツ。",
    it: "Goditi video di latine calde in alta definizione. Contenuto HD di modelle provenienti da Colombia, Brasile, Messico e altro.",
    pt: "Desfrute de vídeos de latinas quentes em alta definição. Conteúdo HD de modelos da Colômbia, Brasil, México e muito mais.",
    sl: "Uživajte v vročih videoposnetkih latino deklet v visoki ločljivosti. HD vsebina modelov iz Kolumbije, Brazilije, Mehike in več.",
    da: "Nyd frække latina-videoer i høj opløsning. HD-indhold med modeller fra Colombia, Brasilien, Mexico og mere."
  },
  ebony: {
    es: "La mejor colección de videos de negras y ebony en alta definición. Disfruta de la mejor calidad premium.",
    en: "The best collection of black and ebony videos in high definition. Enjoy the best premium quality.",
    fr: "La meilleure collection de vidéos de femmes noires et ébène en haute définition. Qualité premium.",
    ja: "高画質の黒人とエボニーの動画の最高のコレクション。最高のプレミアム品質をお楽しみください。",
    it: "La migliore collezione di video di nere ed ebano in alta definizione. Goditi la migliore qualità premium.",
    pt: "A melhor coleção de vídeos de negras e ebony em alta definição. Desfrute da melhor qualidade premium.",
    sl: "Najboljša zbirka videoposnetkov temnopoltih deklet v visoki ločljivosti. Uživajte v najboljši premium kakovosti.",
    da: "Den bedste samling af mørke og ebony-videoer i høj opløsning. Nyd den bedste premium-kvalitet."
  },
  webcams: {
    es: "Accede a las mejores salas de webcams premium en vivo. Chat en directo con miles de modelos online.",
    en: "Access the best premium live webcam rooms. Live chat with thousands of models online.",
    fr: "Accédez aux meilleurs salons de webcams en direct premium. Chat en direct avec des modèles.",
    ja: "最高のプレミアムライブチャットルームにアクセス。何千人ものモデルとのライブチャット。",
    it: "Accedi alle migliori stanze di webcam dal vivo premium. Chat dal vivo con modelle online.",
    pt: "Aceda às melhores salas de webcams premium ao vivo. Chat ao vivo com modelos online.",
    sl: "Dostopajte do najboljših premium sob s spletnimi kamerami v živo. Klepet v živo s tisoči modelov na spletu.",
    da: "Få adgang til de bedste live webcam-rum. Live chat med tusindvis af modeller online."
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

  const title = `Videos de Categoría ${catName} HD | Zintia Vids`;
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
        sl: `/category/${id}?lang=sl`,
        da: `/category/${id}?lang=da`,
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
