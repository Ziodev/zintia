/**
 * Auto-tagger: Extracts meaningful tags from video titles and channel strings.
 * Uses a keyword dictionary to normalize tags across languages.
 */

const TAG_DICTIONARY: Record<string, string[]> = {
  "amateur": ["amateur", "aficionada", "debutante", "first time", "newcomer", "nookie rookie"],
  "anal": ["anal", "ass", "butt", "culo"],
  "asian": ["asian", "japanese", "chinese", "korean", "thai", "filipina"],
  "babe": ["babe", "hottie", "beauty", "gorgeous", "sexy", "seductress"],
  "bbw": ["bbw", "chubby", "curvy", "plump", "thick"],
  "big-ass": ["big ass", "big butt", "booty", "phat ass", "curvilínea"],
  "big-tits": ["big tits", "big boobs", "busty", "big boob", "large breasts"],
  "black": ["black", "ebony", "negra", "nubian", "dark skin", "light skinned"],
  "blonde": ["blonde", "blond", "rubia"],
  "blowjob": ["blowjob", "bj", "oral", "suck", "cock slurp", "mamada", "deepthroat"],
  "brunette": ["brunette", "morena", "dark hair"],
  "casting": ["casting", "audition", "interview"],
  "compilation": ["compilation", "compilación", "best of"],
  "couple": ["couple", "pareja", "boyfriend", "girlfriend", "husband", "wife"],
  "creampie": ["creampie", "cream pie", "internal", "sin censura"],
  "cumshot": ["cumshot", "facial", "jizz", "cum", "spurt", "load"],
  "dildo": ["dildo", "toy", "toys", "vibrator", "sex toy"],
  "doggy": ["doggy", "doggystyle", "from behind", "por detrás"],
  "dp": ["dp", "double penetration", "doble penetración"],
  "ebony": ["ebony", "black girl", "dark skin"],
  "feet": ["feet", "foot", "foot fetish", "toes", "soles"],
  "fingering": ["fingering", "finger", "masturbation", "masturbate", "masturbating"],
  "gangbang": ["gangbang", "gang bang", "group", "grupal", "multiple"],
  "handjob": ["handjob", "hand job", "jerking", "stroke", "tugging"],
  "hardcore": ["hardcore", "hard", "rough", "intense", "intenso", "intenso", "wild", "salvaje"],
  "homemade": ["homemade", "casero", "casera", "home", "amateur", "grabación", "grabado"],
  "interracial": ["interracial", "bbc", "ir"],
  "latina": ["latina", "latin", "colombiana", "venezolana", "brasileña", "mexican", "spanish"],
  "lesbian": ["lesbian", "lesbiana", "girl on girl", "lez"],
  "massage": ["massage", "masaje", "spa", "therapy", "wellness"],
  "mature": ["mature", "madura", "milf", "mom", "mommy", "señora", "cougar", "step mom", "stepmom"],
  "outdoor": ["outdoor", "outside", "public", "street", "beach", "pool", "nature"],
  "pov": ["pov", "point of view", "primera persona"],
  "redhead": ["redhead", "red hair", "ginger", "pelirroja"],
  "skinny": ["skinny", "thin", "slim", "petite", "small", "tiny", "little"],
  "solo": ["solo", "sola", "alone", "self"],
  "squirt": ["squirt", "squirting", "gushing"],
  "stockings": ["stockings", "lingerie", "lace", "panties", "nylon", "medias"],
  "striptease": ["striptease", "strip", "tease", "undressing"],
  "tattoo": ["tattoo", "tattooed", "inked", "pierced"],
  "teen": ["teen", "jovencita", "young", "18", "19", "college", "university", "universitaria", "school"],
  "threesome": ["threesome", "trío", "trio", "3some", "three"],
  "voyeur": ["voyeur", "spy", "hidden", "secreto", "en secreto", "filtrado"],
  "webcam": ["webcam", "cam", "live", "en vivo", "transmisión", "streaming", "broadcast", "directo"],
};

/**
 * Extracts tags from a video title and optional channel string.
 * Returns normalized, deduplicated tag array.
 */
export function extractTags(title: string, channels?: string): string[] {
  const combined = `${title} ${channels || ""}`.toLowerCase();
  const matchedTags = new Set<string>();

  for (const [tag, keywords] of Object.entries(TAG_DICTIONARY)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        matchedTags.add(tag);
        break; // one match per tag is enough
      }
    }
  }

  // Always return at least the "amateur" tag as fallback if nothing matched
  if (matchedTags.size === 0) {
    matchedTags.add("amateur");
  }

  return Array.from(matchedTags);
}

/**
 * Returns the raw channel tags from a DrTuber feed line, normalized.
 */
export function parseChannelTags(channelsString: string): string[] {
  if (!channelsString) return [];
  return channelsString
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length < 40);
}

/**
 * Merges raw channel tags with auto-extracted tags, deduplicating.
 */
export function mergeTags(rawTags: string[], extractedTags: string[]): string[] {
  const set = new Set([...extractedTags, ...rawTags]);
  return Array.from(set).slice(0, 15); // Cap at 15 tags per video
}

import { Language } from "./translations";

const TITLE_DICTIONARY: Record<string, Record<string, string>> = {
  "teens": { es: "jovencitas", fr: "ados", ja: "ティーンたち", it: "teen", pt: "novinhas" },
  "teen": { es: "jovencita", fr: "ado", ja: "ティーン", it: "teen", pt: "novinha" },
  "amateurs": { es: "aficionadas", fr: "amateurs", ja: "素人たち", it: "amatoriali", pt: "amadoras" },
  "amateur": { es: "aficionada", fr: "amateur", ja: "素人", it: "amatoriale", pt: "amadora" },
  "anal": { es: "anal", fr: "anal", ja: "アナル", it: "anale", pt: "anal" },
  "milfs": { es: "maduras", fr: "milfs", ja: "熟女たち", it: "milf", pt: "coroas" },
  "milf": { es: "madura", fr: "milf", ja: "熟女", it: "milf", pt: "coroa" },
  "matures": { es: "maduras", fr: "matures", ja: "熟女たち", it: "mature", pt: "maduras" },
  "mature": { es: "madura", fr: "mature", ja: "熟女", it: "matura", pt: "madura" },
  "homemade": { es: "casero", fr: "fait maison", ja: "自家製", it: "amatoriale", pt: "caseiro" },
  "blowjobs": { es: "mamadas", fr: "fellations", ja: "フェラ", it: "pompini", pt: "boquetes" },
  "blowjob": { es: "mamada", fr: "fellation", ja: "フェラ", it: "pompino", pt: "boquete" },
  "squirts": { es: "squirts", fr: "fontaines", ja: "潮吹きたち", it: "squirt", pt: "squirts" },
  "squirting": { es: "haciendo squirt", fr: "fontaine", ja: "潮吹き", it: "squirt", pt: "squirt" },
  "squirt": { es: "squirt", fr: "fontaine", ja: "潮吹き", it: "squirt", pt: "squirt" },
  "fucking": { es: "follando", fr: "baisant", ja: "ハメ中", it: "trombando", pt: "fodendo" },
  "fucked": { es: "follada", fr: "baisée", ja: "ハメられ", it: "trombata", pt: "fodida" },
  "fuck": { es: "follar", fr: "baiser", ja: "ハメる", it: "trombare", pt: "foder" },
  "pussies": { es: "coños", fr: "chattes", ja: "マンコ", it: "fighe", pt: "bocetas" },
  "pussy": { es: "coño", fr: "chatte", ja: "マンコ", it: "figa", pt: "boceta" },
  "cocks": { es: "pollas", fr: "bites", ja: "ちんこ", it: "cazzi", pt: "paus" },
  "cock": { es: "polla", fr: "bite", ja: "ちんこ", it: "cazzo", pt: "pau" },
  "big ass": { es: "culo grande", fr: "gros cul", ja: "デカ尻", it: "grosso culo", pt: "bundão" },
  "big-ass": { es: "culo grande", fr: "gros cul", ja: "デカ尻", it: "grosso culo", pt: "bundão" },
  "big tits": { es: "tetona", fr: "gros seins", ja: "巨乳", it: "tettone", pt: "peituda" },
  "big-tits": { es: "tetona", fr: "gros seins", ja: "巨乳", it: "tettone", pt: "peituda" },
  "ebony": { es: "negra", fr: "ébène", ja: "黒人", it: "ebano", pt: "negra" },
  "black": { es: "negra", fr: "ébène", ja: "黒人", it: "ebano", pt: "negra" },
  "latinas": { es: "latinas", fr: "latines", ja: "ラテン系たち", it: "latine", pt: "latinas" },
  "latina": { es: "latina", fr: "latine", ja: "ラテン系", it: "latina", pt: "latina" },
  "asians": { es: "asiáticas", fr: "asiatiques", ja: "アジアンたち", it: "asiatiche", pt: "asiáticas" },
  "asian": { es: "asiática", fr: "asiatique", ja: "アジアン", it: "asiatica", pt: "asiática" },
  "threesome": { es: "trío", fr: "trio", ja: "3P", it: "trio", pt: "trio" },
  "cumshots": { es: "corridas", fr: "cumshots", ja: "顔射", it: "sborrate", pt: "gozadas" },
  "cumshot": { es: "corrida", fr: "cumshot", ja: "顔射", it: "sborrata", pt: "gozada" },
  "creampies": { es: "creampies", fr: "creampies", ja: "中出し", it: "creampie", pt: "creampies" },
  "creampie": { es: "creampie", fr: "creampie", ja: "中出し", it: "creampie", pt: "creampie" },
  "lesbians": { es: "lesbianas", fr: "lesbiennes", ja: "レズビアンたち", it: "lesbiche", pt: "lésbicas" },
  "lesbian": { es: "lesbiana", fr: "lesbienne", ja: "レズビアン", it: "lesbica", pt: "lésbica" },
  "feet": { es: "pies", fr: "pieds", ja: "足フェチ", it: "piedi", pt: "pés" },
  "dildo": { es: "juguete", fr: "godefroy", ja: "ディルド", it: "dildo", pt: "consolo" },
  "toys": { es: "juguetes", fr: "jouets", ja: "おもちゃ", it: "giocattoli", pt: "brinquedos" },
  "toy": { es: "juguete", fr: "jouet", ja: "おもちゃ", it: "giocattolo", pt: "brinquedo" },
  "massage": { es: "masaje", fr: "massage", ja: "マッサージ", it: "massaggio", pt: "massagem" },
  "outdoor": { es: "al aire libre", fr: "en extérieur", ja: "野外", it: "all'aperto", pt: "ao ar livre" },
  "gangbang": { es: "gangbang", fr: "gangbang", ja: "ハメ合", it: "gangbang", pt: "gangbang" },
  "deepthroat": { es: "garganta profunda", fr: "gorge profonde", ja: "ディープスロート", it: "gola profonda", pt: "garganta profunda" },
  "titjob": { es: "paja rusa", fr: "branlette espagnole", ja: "パイズリ", it: "tetta", pt: "espanhola" },
  "doggystyle": { es: "en cuatro", fr: "lévrette", ja: "バックハメ", it: "pecora", pt: "de quatro" },
  "facial": { es: "facial", fr: "facial", ja: "顔射", it: "facciale", pt: "facial" },
  "wife": { es: "esposa", fr: "femme", ja: "妻", it: "moglie", pt: "esposa" },
  "husband": { es: "esposo", fr: "mari", ja: "夫", it: "marito", pt: "marido" },
  "girlfriend": { es: "novia", fr: "petite amie", ja: "彼女", it: "fidanzata", pt: "namorada" },
  "boyfriend": { es: "novio", fr: "petit ami", ja: "彼氏", it: "fidanzato", pt: "namorado" },
  "hairy": { es: "peluda", fr: "poilue", ja: "パイパンじゃない", it: "pelosa", pt: "peluda" },
  "shaved": { es: "afeitada", fr: "rasée", ja: "パイパン", it: "depilata", pt: "depilata" },
  "tight": { es: "estrecha", fr: "serrée", ja: "名器", it: "stretta", pt: "apertada" },
  "little": { es: "pequeña", fr: "petite", ja: "小柄", it: "piccola", pt: "pequena" },
  "young": { es: "joven", fr: "jeune", ja: "若い", it: "giovane", pt: "jovem" },
  "sexy": { es: "atractiva", fr: "séduisante", ja: "セクシー", it: "sensuale", pt: "atraente" },
  "babe": { es: "belleza", fr: "babe", ja: "美女", it: "bambola", pt: "gata" },
  "girl": { es: "chica", fr: "fille", ja: "女の子", it: "ragazza", pt: "garota" },
  "woman": { es: "mujer", fr: "femme", ja: "女性", it: "donna", pt: "mulher" },
  "girls": { es: "chicas", fr: "filles", ja: "女の子たち", it: "ragazze", pt: "garotas" },
  "women": { es: "mujeres", fr: "femmes", ja: "女性たち", it: "donne", pt: "mulheres" }
};

export function translateTitle(title: string, lang: Language): string {
  if (lang === "en" || !title) return title;

  let translated = title;
  // Sort keys by length descending to translate multi-word terms (like "big tits") before single words (like "tits")
  const sortedKeys = Object.keys(TITLE_DICTIONARY).sort((a, b) => b.length - a.length);

  for (const word of sortedKeys) {
    const replacement = TITLE_DICTIONARY[word][lang];
    if (replacement) {
      // Use case-insensitive regex matching word boundaries
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      translated = translated.replace(regex, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }
  }

  return translated;
}
