"use client";

import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { Hash, X } from "lucide-react";
import { Video } from "@/lib/data";
import { translations, Language } from "@/lib/translations";

// Bilingual display names for normalized tags
export const TAG_LABELS: Record<string, Record<string, string>> = {
  "amateur": { es: "Amateur", en: "Amateur", fr: "Amateur", ja: "アマチュア", it: "Amatoriale", pt: "Amador" },
  "anal": { es: "Anal", en: "Anal", fr: "Anal", ja: "アナル", it: "Anale", pt: "Anal" },
  "asian": { es: "Asiáticas", en: "Asian", fr: "Asiatique", ja: "アジアン", it: "Asiatica", pt: "Asiática" },
  "babe": { es: "Bellezas", en: "Babes", fr: "Belles", ja: "美女", it: "Belle", pt: "Gatas" },
  "bbw": { es: "BBW", en: "BBW", fr: "BBW", ja: "BBW", it: "BBW", pt: "BBW" },
  "big-ass": { es: "Culos", en: "Big Ass", fr: "Gros Cul", ja: "デカ尻", it: "Grosso Culo", pt: "Bundão" },
  "big-tits": { es: "Tetonas", en: "Big Tits", fr: "Gros Seins", ja: "巨乳", it: "Tettone", pt: "Peituda" },
  "black": { es: "Negras", en: "Ebony", fr: "Ébène", ja: "黒人", it: "Ebano", pt: "Negras" },
  "blonde": { es: "Rubias", en: "Blonde", fr: "Blonde", ja: "ブロンド", it: "Bionda", pt: "Loiras" },
  "blowjob": { es: "Mamadas", en: "Blowjob", fr: "Fellation", ja: "フェラ", it: "Pompino", pt: "Boquete" },
  "brunette": { es: "Morenas", en: "Brunette", fr: "Brune", ja: "ブルネット", it: "Bruna", pt: "Morena" },
  "compilation": { es: "Compilaciones", en: "Compilation", fr: "Compilation", ja: "コンピ", it: "Compilazione", pt: "Compilação" },
  "couple": { es: "Parejas", en: "Couples", fr: "Couples", ja: "カップル", it: "Coppie", pt: "Casais" },
  "creampie": { es: "Creampie", en: "Creampie", fr: "Éjac Interne", ja: "中出し", it: "Creampie", pt: "Gozada Interna" },
  "cumshot": { es: "Corridas", en: "Cumshot", fr: "Éjaculation", ja: "顔射", it: "Sborrata", pt: "Ejaculação" },
  "dildo": { es: "Juguetes", en: "Toys", fr: "Jouets", ja: "おもちゃ", it: "Giocattoli", pt: "Brinquedos" },
  "dp": { es: "Doble P.", en: "Double P.", fr: "Double P.", ja: "2穴", it: "Doppia P.", pt: "Dupla P." },
  "feet": { es: "Pies", en: "Feet", fr: "Pieds", ja: "足フェチ", it: "Piedi", pt: "Pés" },
  "fingering": { es: "Masturbación", en: "Masturbation", fr: "Masturbation", ja: "オナニー", it: "Masturbazione", pt: "Masturbação" },
  "gangbang": { es: "Gangbang", en: "Gangbang", fr: "Gangbang", ja: "乱交", it: "Gangbang", pt: "Gangbang" },
  "handjob": { es: "Pajas", en: "Handjob", fr: "Branlette", ja: "手コキ", it: "Sega", pt: "Punheta" },
  "hardcore": { es: "Hardcore", en: "Hardcore", fr: "Hardcore", ja: "ハードコア", it: "Hardcore", pt: "Hardcore" },
  "homemade": { es: "Caseros", en: "Homemade", fr: "Fait Maison", ja: "自撮り", it: "Fatto in Casa", pt: "Caseiro" },
  "interracial": { es: "Interracial", en: "Interracial", fr: "Interracial", ja: "異人種間", it: "Interrazziale", pt: "Interracial" },
  "latina": { es: "Latinas", en: "Latina", fr: "Latine", ja: "ラテン系", it: "Latina", pt: "Latinas" },
  "lesbian": { es: "Lesbianas", en: "Lesbian", fr: "Lesbienne", ja: "レズ", it: "Lesbica", pt: "Lésbica" },
  "massage": { es: "Masajes", en: "Massage", fr: "Massage", ja: "マッサージ", it: "Massaggio", pt: "Massagem" },
  "mature": { es: "Maduras", en: "Mature", fr: "Mature", ja: "熟女", it: "Matura", pt: "Madura" },
  "outdoor": { es: "Al Aire Libre", en: "Outdoor", fr: "En Extérieur", ja: "野外", it: "All'Aperto", pt: "Ao Ar Livre" },
  "pov": { es: "POV", en: "POV", fr: "POV", ja: "POV", it: "POV", pt: "POV" },
  "redhead": { es: "Pelirrojas", en: "Redhead", fr: "Rousse", ja: "赤毛", it: "Rossa", pt: "Ruiva" },
  "skinny": { es: "Delgadas", en: "Petite", fr: "Petite", ja: "スレンダー", it: "Magra", pt: "Magra" },
  "solo": { es: "Solo", en: "Solo", fr: "Solo", ja: "ソロ", it: "Solo", pt: "Solo" },
  "squirt": { es: "Squirt", en: "Squirt", fr: "Fontaine", ja: "潮吹き", it: "Squirt", pt: "Squirt" },
  "stockings": { es: "Lencería", en: "Lingerie", fr: "Lingerie", ja: "ランジェリー", it: "Lingerie", pt: "Lingerie" },
  "striptease": { es: "Striptease", en: "Striptease", fr: "Striptease", ja: "ストリップ", it: "Striptease", pt: "Striptease" },
  "tattoo": { es: "Tatuadas", en: "Tattooed", fr: "Tatouée", ja: "タトゥー", it: "Tatuata", pt: "Tatuada" },
  "teen": { es: "Jovencitas", en: "Teen", fr: "Ado", ja: "ティーン", it: "Teen", pt: "Novinhas" },
  "threesome": { es: "Tríos", en: "Threesome", fr: "Trio", ja: "3P", it: "Trio", pt: "Trio" },
  "voyeur": { es: "Voyeur", en: "Voyeur", fr: "Voyeur", ja: "盗撮", it: "Voyeur", pt: "Voyeur" },
  "webcam": { es: "Webcam", en: "Webcam", fr: "Webcam", ja: "ウェブカメラ", it: "Webcam", pt: "Webcam" },
};

interface TagCloudProps {
  videos: Video[];
}

export function TagCloud({ videos }: TagCloudProps) {
  const [activeTag, setActiveTag] = useQueryState("tag", {
    defaultValue: "",
    shallow: true,
  });

  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";

  // Calculate tag frequencies from all videos
  const tagCounts = new Map<string, number>();
  for (const video of videos) {
    if (!video.tags) continue;
    for (const tag of video.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  // Sort by frequency descending, take top 30
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  if (sortedTags.length === 0) return null;

  const getLabel = (tag: string) => {
    const labels = TAG_LABELS[tag];
    if (labels) return labels[activeLang] || labels.en || tag;
    // Capitalize first letter for unknown tags
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Hash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tags</span>
        {activeTag && (
          <button
            onClick={() => setActiveTag("")}
            className="ml-auto flex items-center gap-1 text-[10px] font-medium text-rose-400 hover:text-rose-300 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>
      <div className="flex w-full overflow-x-auto gap-1.5 pb-1 no-scrollbar whitespace-nowrap scroll-smooth flex-nowrap items-center">
        {sortedTags.map(([tag, count]) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(isActive ? "" : tag)}
              className={cn(
                "whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all duration-200 active:scale-95 flex items-center gap-1",
                isActive
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-sm shadow-rose-500/10"
                  : "bg-zinc-900/60 border-white/5 text-muted-foreground hover:text-white hover:bg-zinc-800 hover:border-white/10"
              )}
            >
              <span>{getLabel(tag)}</span>
              <span className={cn(
                "text-[9px] font-bold",
                isActive ? "text-rose-500/60" : "text-zinc-600"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
