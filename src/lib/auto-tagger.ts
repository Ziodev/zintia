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
  // Common multi-word phrases (longest first for precedence)
  "my new boyfriend": { es: "mi nuevo novio", fr: "mon nouveau copain", ja: "新しい彼氏", it: "il mio nuovo fidanzato", pt: "meu novo namorado" },
  "my new girlfriend": { es: "mi nueva novia", fr: "ma nouvelle copine", ja: "新しい彼女", it: "la mia nuova fidanzata", pt: "minha nova namorada" },
  "deep throat": { es: "garganta profunda", fr: "gorge profonde", ja: "ディープスロート", it: "gola profonda", pt: "garganta profunda" },
  "deepthroat": { es: "garganta profunda", fr: "gorge profonde", ja: "ディープスロート", it: "gola profonda", pt: "garganta profunda" },
  "blindfolded girl": { es: "chica con ojos vendados", fr: "fille aux yeux bandés", ja: "目隠し少女", it: "ragazza bendata", pt: "garota com olhos vendados" },
  "dirty talk": { es: "hablar sucio", fr: "paroles sales", ja: "卑猥な会話", it: "parole sporche", pt: "conversa sacana" },
  "shaved pussy": { es: "coño afeitado", fr: "chatte rasée", ja: "パイパン", it: "figa depilata", pt: "boceta depilada" },
  "hairy pussy": { es: "coño peludo", fr: "chatte poilue", ja: "陰毛ありマンコ", it: "figa pelosa", pt: "boceta peluda" },
  "wet pussy": { es: "coño mojado", fr: "chatte mouillée", ja: "濡れたマンコ", it: "figa bagnata", pt: "boceta molhada" },
  "tight pussy": { es: "coño estrecho", fr: "chatte serrée", ja: "名器マンコ", it: "figa stretta", pt: "boceta apertada" },
  "huge boobs": { es: "tetas enormes", fr: "seins énormes", ja: "爆乳", it: "tette enormi", pt: "peitos enormes" },
  "big boobs": { es: "tetona", fr: "gros seins", ja: "巨乳", it: "tettone", pt: "peituda" },
  "small tits": { es: "tetas pequeñas", fr: "petits seins", ja: "微乳", it: "tette piccole", pt: "peitos pequenos" },
  "huge dick": { es: "polla enorme", fr: "bite énorme", ja: "巨根", it: "cazzo enorme", pt: "pau enorme" },
  "big dick": { es: "polla grande", fr: "grosse bite", ja: "デカちん", it: "cazzo grande", pt: "pau grande" },
  "huge cock": { es: "polla enorme", fr: "bite énorme", ja: "巨根", it: "cazzo enorme", pt: "pau enorme" },
  "big cock": { es: "polla grande", fr: "grosse bite", ja: "デカちん", it: "cazzo grande", pt: "pau grande" },
  "hard cock": { es: "polla dura", fr: "bite dure", ja: "勃起ちんこ", it: "cazzo duro", pt: "pau duro" },
  "hard dick": { es: "polla dura", fr: "bite dure", ja: "勃起ちんこ", it: "cazzo duro", pt: "pau duro" },
  "rough sex": { es: "sexo salvaje", fr: "sexe sauvage", ja: "激しいセックス", it: "sesso selvaggio", pt: "sexo selvagem" },
  "hardcore sex": { es: "sexo duro", fr: "sexe hardcore", ja: "ハードコアセックス", it: "sesso hardcore", pt: "sexo hardcore" },
  "first time": { es: "primera vez", fr: "première fois", ja: "初体験", it: "prima volta", pt: "primeira vez" },
  "cute girl": { es: "chica linda", fr: "jolie fille", ja: "可愛い女の子", it: "ragazza carina", pt: "garota linda" },
  "sexy girl": { es: "chica sexy", fr: "fille sexy", ja: "セクシーな女の子", it: "ragazza sexy", pt: "garota sexy" },
  "hot girl": { es: "chica caliente", fr: "fille chaude", ja: "熱い女の子", it: "ragazza calda", pt: "garota gostosa" },
  "beautiful girl": { es: "chica hermosa", fr: "belle fille", ja: "美人な女の子", it: "bella ragazza", pt: "garota linda" },
  "solo girl": { es: "chica sola", fr: "fille seule", ja: "ソロ美少女", it: "ragazza sola", pt: "garota sozinha" },
  "step mom": { es: "madrastra", fr: "belle-mère", ja: "義母", it: "matrigna", pt: "madrasta" },
  "stepmom": { es: "madrastra", fr: "belle-mère", ja: "義母", it: "matrigna", pt: "madrasta" },
  "step sister": { es: "hermanastra", fr: "demi-sœur", ja: "義妹", it: "sorellastra", pt: "meia-irmã" },
  "stepsister": { es: "hermanastra", fr: "demi-sœur", ja: "義妹", it: "sorellastra", pt: "meia-irmã" },
  "step daughter": { es: "hijastra", fr: "belle-fille", ja: "義娘", it: "figliastra", pt: "enteada" },
  "stepdaughter": { es: "hijastra", fr: "belle-fille", ja: "義娘", it: "figliastra", pt: "enteada" },
  "step son": { es: "hijastro", fr: "beau-fils", ja: "義息子", it: "figliastro", pt: "enteado" },
  "stepson": { es: "hijastro", fr: "beau-fils", ja: "義息子", it: "figliastro", pt: "enteado" },
  "step brother": { es: "hermanastro", fr: "demi-frère", ja: "義兄", it: "fratellastro", pt: "meio-irmão" },
  "stepbrother": { es: "hermanastro", fr: "demi-frère", ja: "義兄", it: "fratellastro", pt: "meio-irmão" },
  "step dad": { es: "padrastro", fr: "beau-père", ja: "義父", it: "patrigno", pt: "padrasto" },
  "stepdad": { es: "padrastro", fr: "beau-père", ja: "義父", it: "patrigno", pt: "padrasto" },
  "in public": { es: "en público", fr: "en public", ja: "野外で", it: "in pubblico", pt: "em público" },
  "at home": { es: "en casa", fr: "à la maison", ja: "家で", it: "a casa", pt: "em casa" },
  "at work": { es: "en el trabajo", fr: "au travail", ja: "職場で", it: "al lavoro", pt: "no trabalho" },
  "catches her": { es: "sorprende a su", fr: "la surprend", ja: "彼女を見つける", it: "la sorprende", pt: "surpreende a" },
  "catches his": { es: "sorprende a su", fr: "le surprend", ja: "彼を見つける", it: "lo sorprende", pt: "surpreende a" },
  "wants a": { es: "quiere una", fr: "veut une", ja: "を欲しがる", it: "vuole una", pt: "quer uma" },
  "wants to": { es: "quiere", fr: "veut", ja: "したい", it: "vuole", pt: "quer" },
  "is back": { es: "está de vuelta", fr: "est de retour", ja: "が戻ってきた", it: "è tornata", pt: "está de volta" },
  "is all about": { es: "se trata de", fr: "s'occupe de", ja: "がすべて", it: "si tratta di", pt: "é tudo sobre" },
  "going to give you": { es: "te va a dar", fr: "va te donner", ja: "をしてあげる", it: "ti darà", pt: "vai te dar" },
  "giving a": { es: "dando un", fr: "donne un", ja: "をする", it: "dando un", pt: "dando um" },
  "gives me a": { es: "me da una", fr: "me donne une", ja: "をしてくれる", it: "mi dà una", pt: "me dá uma" },
  "in the": { es: "en el", fr: "dans le", ja: "で", it: "nel", pt: "no" },
  "with her": { es: "con ella", fr: "avec elle", ja: "彼女と", it: "con lei", pt: "com ela" },
  "with my": { es: "con mi", fr: "avec mon", ja: "私と", it: "con il mio", pt: "com meu" },
  "right here": { es: "aquí mismo", fr: "ici même", ja: "ここで", it: "proprio qui", pt: "aqui mesmo" },
  "good fuck": { es: "buena follada", fr: "bonne baise", ja: "激しいハメ", it: "bella trombata", pt: "boa fodida" },
  "deep dicking": { es: "penetración profunda", fr: "pénétration profonde", ja: "ディープハメ", it: "penetrazione profonda", pt: "penetrazione profunda" },
  "fat slut": { es: "putita gorda", fr: "grosse salope", ja: "ぽっちゃり淫乱娘", it: "puttana grassa", pt: "putinha gorda" },
  "blindfolded": { es: "con ojos vendados", fr: "les yeux bandés", ja: "目隠し", it: "bendata", pt: "com os olhos vendados" },
  "seducing a": { es: "seduciendo a una", fr: "séduire une", ja: "を誘惑する", it: "sedurre una", pt: "seduzindo uma" },
  "is fucking": { es: "está follando", fr: "baisant", ja: "ハメ中", it: "sta trombando", pt: "está fodendo" },
  "is sucking": { es: "está chupando", fr: "suçant", ja: "しゃぶり中", it: "sta succhiando", pt: "está chupando" },
  "is blowing": { es: "está soplando", fr: "faisant une fellation", ja: "フェラ中", it: "sta facendo un pompino", pt: "está chupando" },
  "is riding": { es: "está cabalgando", fr: "chevauchant", ja: "騎乗中", it: "sta cavalcando", pt: "está cavalgando" },
  "is licking": { es: "está lamiendo", fr: "léchant", ja: "クンニ中", it: "sta leccando", pt: "está lambendo" },
  "is rubbing": { es: "está frotando", fr: "frottant", ja: "こすり中", it: "sta sfregando", pt: "está frotando" },
  "is touching": { es: "está tocando", fr: "touchant", ja: "愛撫中", it: "sta toccando", pt: "está tocando" },
  "is playing": { es: "está jugando", fr: "jouant", ja: "プレイ中", it: "sta giocando", pt: "está brincando" },
  "is masturbating": { es: "está masturbándose", fr: "se masturbant", ja: "オナニー中", it: "si masturba", pt: "está se masturbando" },
  "gets fucked": { es: "es follada", fr: "se fait baiser", ja: "ハメられる", it: "viene trombata", pt: "é fodida" },
  "gets sucked": { es: "es chupada", fr: "se fait sucer", ja: "吸われる", it: "viene succhiata", pt: "é chupada" },
  "gets licked": { es: "es lamida", fr: "se fait lécher", ja: "舐められる", it: "viene leccata", pt: "é lambida" },
  "wants to fuck": { es: "quiere follar", fr: "veut baiser", ja: "やりたがる", it: "vuole trombrae", pt: "quer foder" },
  "loves to fuck": { es: "le encanta follar", fr: "adore baiser", ja: "ハメるのが大好き", it: "adora trombrae", pt: "adora foder" },
  "likes to watch": { es: "le gusta observar", fr: "aime regarder", ja: "見るのが好き", it: "gli piace guardare", pt: "gosta de assistir" },
  "watches her": { es: "la observa", fr: "la regarde", ja: "彼女を見る", it: "la guarda", pt: "a assiste" },
  "watches him": { es: "lo observa", fr: "le regarde", ja: "彼を見る", it: "lo guarda", pt: "o assiste" },
  "catches him": { es: "lo sorprende", fr: "le surprend", ja: "彼を見つける", it: "lo sorprende", pt: "o sorprende" },

  // Base word entries
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
  "women": { es: "mujeres", fr: "femmes", ja: "女性たち", it: "donne", pt: "mulheres" },

  // Prepositions / Connectors / Verbs
  "shows": { es: "muestra", fr: "montre", it: "mostra", pt: "mostra", ja: "露出" },
  "doing": { es: "haciendo", fr: "faisant", it: "facendo", pt: "fazendo", ja: "している" },
  "cums": { es: "se corre", fr: "jouit", it: "sborra", pt: "goza", ja: "イく" },
  "with": { es: "con", fr: "avec", it: "con", pt: "com", ja: "と" },
  "and": { es: "y", fr: "et", it: "e", pt: "e", ja: "と" },
  "for": { es: "para", fr: "pour", it: "per", pt: "para", ja: "向け" },
  "she": { es: "ella", fr: "elle", it: "lei", pt: "ela", ja: "彼女" },
  "her": { es: "su", fr: "sa", it: "sua", pt: "sua", ja: "彼女の" },
  "his": { es: "su", fr: "son", it: "suo", pt: "seu", ja: "彼の" },
  "him": { es: "él", fr: "lui", it: "lui", pt: "ele", ja: "er" },
  "naked": { es: "desnuda", fr: "nue", it: "nuda", pt: "nua", ja: "裸" },
  "erotic": { es: "erótico", fr: "érotique", it: "erotico", pt: "erótico", ja: "官能" },
  "friend": { es: "amigo", fr: "ami", it: "amico", pt: "amigo", ja: "友達" },
  "friends": { es: "amigos", fr: "amis", it: "amici", pt: "amigos", ja: "友達たち" },
  "shares": { es: "comparte", fr: "partage", it: "condivide", pt: "compartilha", ja: "共有" },
  "swallows": { es: "traga", fr: "avale", it: "ingoia", pt: "engole", ja: "飲み込む" },
  "sucks": { es: "chupa", fr: "suce", it: "succhia", pt: "chupa", ja: "吸う" },
  "licks": { es: "lame", fr: "lèche", it: "lecca", pt: "lambe", ja: "舐める" },
  "rides": { es: "cabalga", fr: "chevauche", it: "cavalca", pt: "cavalca", ja: "跨る" },
  "wants": { es: "quiere", fr: "veut", it: "vuole", pt: "quer", ja: "したい" },
  "needs": { es: "necesita", fr: "a besoin de", it: "ha bisogno di", pt: "precisa", ja: "必要" },
  "likes": { es: "le gusta", fr: "aime", it: "piace", pt: "gosta", ja: "好き" },
  "loves": { es: "le encanta", fr: "adore", it: "ama", pt: "ama", ja: "大好き" },
  "watches": { es: "observa", fr: "regarde", it: "guarda", pt: "assiste", ja: "見る" },
  "spy": { es: "espía", fr: "espionne", it: "spia", pt: "espia", ja: "スパイ" },
  "hidden": { es: "oculto", fr: "caché", it: "nascosto", pt: "escondido", ja: "隠し" },
  "catches": { es: "sorprende", fr: "surprend", it: "sorprende", pt: "surpreende", ja: "見つける" },
  "surprise": { es: "sorpresa", fr: "surprise", it: "sorpresa", pt: "surpresa", ja: "サプライズ" },
  "teacher": { es: "maestra", fr: "enseignante", it: "insegnante", pt: "professora", ja: "先生" },
  "student": { es: "estudiante", fr: "étudiante", it: "studentessa", pt: "estudante", ja: "学生" },
  "office": { es: "oficina", fr: "bureau", it: "ufficio", pt: "escritório", ja: "オフィス" },
  "boss": { es: "jefe", fr: "patron", it: "capo", pt: "chefe", ja: "ボス" },
  "secretary": { es: "secretaria", fr: "secrétaire", it: "segretaria", pt: "secretária", ja: "秘書" },
  "hotel": { es: "hotel", fr: "hôtel", it: "hotel", pt: "hotel", ja: "ホテル" },
  "room": { es: "habitación", fr: "chambre", it: "camera", pt: "quarto", ja: "部屋" },
  "bed": { es: "cama", fr: "lit", it: "letto", pt: "cama", ja: "ベッド" },
  "shower": { es: "ducha", fr: "douche", it: "doccia", pt: "chuveiro", ja: "シャワー" },
  "bathroom": { es: "baño", fr: "salle de bain", it: "bagno", pt: "banheiro", ja: "浴室" },
  "car": { es: "coche", fr: "voiture", it: "auto", pt: "carro", ja: "車" },
  "pool": { es: "piscina", fr: "piscine", it: "piscina", pt: "piscina", ja: "プール" },
  "beach": { es: "playa", fr: "plage", it: "spiaggia", pt: "praia", ja: "ビーチ" },
  "house": { es: "casa", fr: "maison", it: "casa", pt: "casa", ja: "家" },
  "kitchen": { es: "cocina", fr: "cuisine", it: "cucina", pt: "cozinha", ja: "台所" },
  "couch": { es: "sofá", fr: "canapé", it: "divano", pt: "sofá", ja: "ソファー" },
  "sofa": { es: "sofá", fr: "canapé", it: "divano", pt: "sofá", ja: "ソファー" },
  "floor": { es: "suelo", fr: "sol", it: "pavimento", pt: "chão", ja: "床" },
  "dirty": { es: "sucio", fr: "sale", it: "sporco", pt: "sujo", ja: "汚い" },
  "words": { es: "palabras", fr: "mots", it: "parole", pt: "palavras", ja: "言葉" },
  "hard": { es: "duro", fr: "dur", it: "duro", pt: "duro", ja: "激しい" },
  "soft": { es: "suave", fr: "doux", it: "morbido", pt: "suave", ja: "柔らかい" },
  "sweet": { es: "dulce", fr: "doux", it: "dolce", pt: "doce", ja: "甘い" },
  "slow": { es: "lento", fr: "lent", it: "lento", pt: "lento", ja: "スロウ" },
  "slowly": { es: "lentamente", fr: "lentement", it: "lentamente", pt: "lentamente", ja: "ゆっくり" },
  "fast": { es: "rápido", fr: "rapide", it: "veloce", pt: "rápido", ja: "速い" },
  "quick": { es: "rápido", fr: "rapide", it: "veloce", pt: "rápido", ja: "速い" },
  "big": { es: "grande", fr: "grand", it: "grande", pt: "grande", ja: "大きい" },
  "huge": { es: "enorme", fr: "énorme", it: "enorme", pt: "enorme", ja: "巨大な" },
  "small": { es: "pequeño", fr: "petit", it: "piccolo", pt: "pequeno", ja: "小さい" },
  "tiny": { es: "diminuto", fr: "minuscule", it: "minuscolo", pt: "minúsculo", ja: "極小" },
  "short": { es: "corto", fr: "court", it: "corto", pt: "curto", ja: "短い" },
  "long": { es: "largo", fr: "long", it: "lungo", pt: "longo", ja: "長い" },
  "deep": { es: "profundo", fr: "profond", it: "profondo", pt: "profundo", ja: "深い" },
  "throat": { es: "garganta", fr: "gorge", it: "gola", pt: "garganta", ja: "喉" },
  "mouth": { es: "boca", fr: "bouche", it: "bocca", pt: "boca", ja: "口" },
  "eyes": { es: "ojos", fr: "yeux", it: "occhi", pt: "olhos", ja: "目" },
  "face": { es: "cara", fr: "visage", it: "faccia", pt: "rosto", ja: "顔" },
  "hand": { es: "mano", fr: "main", it: "mano", pt: "mão", ja: "手" },
  "hands": { es: "manos", fr: "mains", it: "mani", pt: "mãos", ja: "手たち" },
  "finger": { es: "dedo", fr: "doigt", it: "dito", pt: "dedo", ja: "指" },
  "fingers": { es: "dedos", fr: "doigts", it: "dita", pt: "dedos", ja: "指たち" },
  "body": { es: "cuerpo", fr: "corps", it: "corpo", pt: "corpo", ja: "体" },
  "skin": { es: "piel", fr: "peau", it: "pelle", pt: "pele", ja: "肌" },
  "hair": { es: "pelo", fr: "cheveux", it: "capelli", pt: "cabelo", ja: "髪" },
  "wet": { es: "mojada", fr: "mouillée", it: "bagnata", pt: "molhada", ja: "濡れた" },
  "cream": { es: "crema", fr: "crème", it: "crema", pt: "creme", ja: "クリーム" },
  "pie": { es: "leche", fr: "tarte", it: "crema", pt: "creme", ja: "パイ" },
  "cum": { es: "correrse", fr: "jouir", it: "sborrare", pt: "gozar", ja: "イく" },
  "load": { es: "carga", fr: "charge", it: "sborrata", pt: "carga", ja: "ザーメン" },
  "gush": { es: "chorro", fr: "jet", it: "spruzzo", pt: "jorro", ja: "潮吹き" }
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
