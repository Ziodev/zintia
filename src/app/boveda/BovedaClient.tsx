"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Users, 
  MapPin, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { DRTUBER_FALLBACK_VIDEOS } from "@/lib/drtuber_fallback";

interface BovedaClientProps {
  country: string;
  city: string;
  isBot: boolean;
  clickId?: string;
  zoneId?: string;
  initialVideos?: any[];
}

// Dynamic background tiles derived from video feed

const tzToCountryMap: Record<string, string> = {
  "santo_domingo": "DO",
  "madrid": "ES",
  "mexico_city": "MX",
  "monterrey": "MX",
  "tijuana": "MX",
  "bogota": "CO",
  "buenos_aires": "AR",
  "santiago": "CL",
  "lima": "PE",
  "caracas": "VE",
  "quito": "EC",
  "montevideo": "UY",
  "asuncion": "PY",
  "la_paz": "BO",
  "guatemala": "GT",
  "san_jose": "CR",
  "tegucigalpa": "HN",
  "managua": "NI",
  "san_salvador": "SV",
  "panama": "PA",
  "san_juan": "PR"
};

const OBFUSCATED_URLS = {
  tier2: "aHR0cHM6Ly93d3cudW5kZXJsaW5nbWlzdGVyeS5zdXBwb3J0Lz9zbD02MTExMjk3LWY2NWI3", // Mobidea Smartlink base
  tier3: "aHR0cHM6Ly93d3cudW5kZXJsaW5nbWlzdGVyeS5zdXBwb3J0Lz9zbD02MTExMjk3LWY2NWI3"  // Mobidea Smartlink base
};

// Obfuscated adultforce lineup offers for Tier 1 rotation (A/B/C/D split test)
const ADULTFORCE_OFFERS = [
  { name: 'Brazzers', url: 'aHR0cHM6Ly9sYW5kaW5nLmJyYXp6ZXJzbmV0d29yay5jb20vP2F0cz1leUpoSWpvek1ETXpNRGNzSW1NaU9qVTROalEwT1RVNUxDSnVJam94TkN3aWN5STZPVEFzSW1VaU9qZzRNRE1zSW5BaU9qRXhmUT09' },
  { name: 'Mofos', url: 'aHR0cHM6Ly9sYW5kaW5nLm1vZm9zbmV0d29yay5jb20vP2F0cz1leUpoSWpvek1ETXpNRGNzSW1NaU9qVTROalEwT1RVNUxDSnVJam94TlN3aWN5STZNVGMyTENKbElqbzRPVFF6TENKd0lqb3hNWDA9' },
  { name: 'CandyAI', url: 'aHR0cHM6Ly90cmFjay5hZnRyazMuY29tLzM4ZGY2ZjEyLWYxMDMtNDUyZi05Mzg2LTIyYmJhODhlYzhlZj9hdHM9ZXlKaElqb3pNRE16TURjc0ltTWlPalU0TmpRME9UVTVMQ0p1SWpvek55d2ljeUk2TnpNMUxDSmxJam94TVRBMU1pd2ljQ0k2TXpFM2ZRPT0mYWZmX3Rva2VuPUV5aDFjM1Y0' },
  { name: 'BangBros', url: 'aHR0cHM6Ly9sYW5kaW5nLmJhbmdicm9zbmV0d29yay5jb20vP2F0cz1leUpoSWpvek1ETXpNRGNzSW1NaU9qVTROalEwT1RVNUxDSnVJam94TXpBc0luTWlPalk1TXl3aVpTSTZNVEEyTnpNc0luQWlPakV4ZlE9PQ==' }
];

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return "";
  }
};

export function BovedaClient({ country, city, isBot, clickId, zoneId, initialVideos }: BovedaClientProps) {
  const [step, setStep] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(120); 
  const [displayCity, setDisplayCity] = useState(city);
  const [displayCountry, setDisplayCountry] = useState(country);
  const [detectedLang, setDetectedLang] = useState<string>("es");
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(0);
  
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Map dynamic videos to background tiles
  const videos = (initialVideos && initialVideos.length >= 6) 
    ? initialVideos 
    : DRTUBER_FALLBACK_VIDEOS.slice(0, 6);

  const tiles = videos.map((video, idx) => ({
    id: video.id || String(idx),
    title: video.title,
    tag: (video.category || "AMATEUR").toUpperCase(),
    views: video.views || "15.4K",
    match: `${92 + (idx % 8)}%`,
    img: video.thumbnailUrl,
    videoUrl: video.videoPreviewUrl
  }));

  // Choose offer index on mount for Desktop 50/50 split testing session consistency
  useEffect(() => {
    setSelectedOfferIndex(Math.floor(Math.random() * 2)); // 0 or 1 for Mofos/CandyAI split on desktop
  }, []);

  // Decrypt helper for context-sensitive redirects (CRO smartlink)
  const getDecryptedLink = () => {
    if (typeof window === "undefined") return "";

    const c = displayCountry.toUpperCase();
    const tier1Countries = ["US", "GB", "CA", "AU", "DE", "FR"];

    const isMobile = /mobile|android|iphone|ipad|phone/i.test(window.navigator.userAgent || "");

    const mofosUrl = atob(ADULTFORCE_OFFERS[1].url);    // index 1: Mofos
    const candyAIUrl = atob(ADULTFORCE_OFFERS[2].url);  // index 2: CandyAI
    const mobideaUrl = atob(OBFUSCATED_URLS.tier2);

    const click = clickId || sessionStorage.getItem("clickadu_click") || localStorage.getItem("clickadu_click") || "organic";
    const zona = zoneId || sessionStorage.getItem("clickadu_zona") || localStorage.getItem("clickadu_zona") || "organic";

    if (isMobile) {
      if (tier1Countries.includes(c)) {
        // Mobile Tier 1: CandyAI is best (PPA flow, full $30 payout, lower registration friction)
        return `${candyAIUrl}&sub1=${click}&sub2=CandyAI_Mobile`;
      } else {
        // Mobile Global Fallback: Mobidea Smartlink
        return `${mobideaUrl}&pub_click_id=${click}&site=${zona}&pub_sub_id=prelander_boveda_mobile`;
      }
    } else {
      // Desktop Tier 1: 50/50 split between Mofos ($35 payout on desktop) and CandyAI ($35 PPA)
      if (tier1Countries.includes(c)) {
        const isMofos = selectedOfferIndex === 0;
        if (isMofos) {
          return `${mofosUrl}&sub1=${click}&sub2=Mofos_Desktop`;
        } else {
          return `${candyAIUrl}&sub1=${click}&sub2=CandyAI_Desktop`;
        }
      }
      
      // Desktop non-Tier 1 fallback
      return `${mobideaUrl}&pub_click_id=${click}&site=${zona}&pub_sub_id=prelander_boveda_desktop`;
    }
  };


  // 1. CRO Hack: Back-Button Hijack (Capturar el botón de retroceso)
  useEffect(() => {
    // Push an extra history state to create a fake back event
    window.history.pushState(null, "", window.location.href);
    
    const handleBackButton = (e: PopStateEvent) => {
      // Prevent back navigation and send directly to affiliate link
      const targetUrl = getDecryptedLink();
      window.location.replace(targetUrl);
    };

    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [displayCountry, detectedLang, selectedOfferIndex]);

  // 2. CRO Hack: Tab Visibility Alert (Recuperación de pestaña inactiva)
  useEffect(() => {
    const originalTitle = document.title;
    let blinkInterval: NodeJS.Timeout | null = null;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Blink tab title to draw attention
        let showAlternate = false;
        blinkInterval = setInterval(() => {
          document.title = showAlternate 
            ? (detectedLang === "es" ? "⚠️ ACCESO CONCEDIDO" : "⚠️ ACCESS GRANTED")
            : (detectedLang === "es" ? "🔓 Desencriptando..." : "🔓 Decrypting...");
          showAlternate = !showAlternate;
        }, 1200);
      } else {
        // Restore title and stop blinker
        if (blinkInterval) clearInterval(blinkInterval);
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [detectedLang]);

  // Dynamic Browser Language & Timezone Lookup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mainLang = (window.navigator.language || "").split("-")[0].toLowerCase();
      const supported = ["es", "en", "fr", "ja", "it", "pt"];
      if (supported.includes(mainLang)) {
        setDetectedLang(mainLang);
      } else {
        setDetectedLang("es");
      }
    }

    const isGeneric = !city || 
      city.toLowerCase() === "tu área" || 
      city.toLowerCase() === "your area" || 
      city.toLowerCase() === "area" || 
      city.toLowerCase() === "tu ciudad";

    if (isGeneric) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && tz.includes("/")) {
          const cityPart = tz.split("/")[1];
          const cleanedCity = cityPart.replace(/_/g, " ");
          if (cleanedCity) {
            // Capitalize city beautifully
            const capitalizedCity = cleanedCity.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            setDisplayCity(capitalizedCity);
          }
          const matchedCountry = tzToCountryMap[cityPart.toLowerCase()];
          if (matchedCountry) {
            setDisplayCountry(matchedCountry);
          }
        }
      } catch (e) {
        console.error("Failed to guess city from timezone:", e);
      }
    } else {
      setDisplayCity(city);
      setDisplayCountry(country);
    }
  }, [city, country]);

  const handleRedirect = () => {
    const targetUrl = getDecryptedLink();
    window.location.href = targetUrl;
  };

  // Supported Multilanguage Dict
  const dict: Record<string, any> = {
    es: {
      step1Title: `Descubre maduras cerca de ${displayCity}`,
      step1Desc: "¿Qué tipo de encuentros estás buscando?",
      btnAmateur: "Maduras Casadas",
      btnProfessional: "Maduras Solteras",
      step2Title: "Advertencia de Discreción",
      step2Desc: "Este acceso VIP a perfiles locales es confidencial y privado.",
      step2Question: "¿Prometes mantener en secreto la identidad de estas mujeres?",
      btnPromise: "SÍ, LO PROMETO",
      loadingTitle: "Buscando perfiles compatibles...",
      status1: `Analizando perfiles activos en ${displayCity}...`,
      status2: "Verificando disponibilidad para encuentros de hoy...",
      status3: "Filtrando fotos y videos privados sin censura...",
      status4: "Preparando acceso directo al chat local...",
      successTitle: "¡Maduras Encontradas!",
      successExpiry: "Tu acceso VIP expira en:",
      successDesc: `¡Verificación completada! Hemos conectado con perfiles reales y activos cerca de ti en ${displayCity}. Para proteger la privacidad de las usuarias y poder ver sus videos íntimos y contactarlas, activa tu Pase de Acceso VIP de forma segura.`,
      successNote: "Verificación de edad requerida (18+)",
      btnFinal: "VER PERFILES AHORA",
      detailsText: "Red de Encuentros Local 100% Verificada"
    },
    en: {
      step1Title: `Discover mature women near ${displayCity}`,
      step1Desc: "What kind of encounters are you looking for?",
      btnAmateur: "Married Mature Women",
      btnProfessional: "Single Mature Women",
      step2Title: "Discretion Warning",
      step2Desc: "This VIP access to local profiles is confidential and private.",
      step2Question: "Do you promise to keep the identity of these women a secret?",
      btnPromise: "YES, I PROMISE",
      loadingTitle: "Searching for compatible profiles...",
      status1: `Analyzing active profiles in ${displayCity}...`,
      status2: "Verifying availability for encounters today...",
      status3: "Filtering private uncensored photos and videos...",
      status4: "Preparing direct access to local chat...",
      successTitle: "Mature Women Found!",
      successExpiry: "Your VIP access expires in:",
      successDesc: `Verification completed! We have connected with real, active profiles near you in ${displayCity}. To protect the users' privacy and be able to see their intimate videos and contact them, activate your VIP Access Pass securely.`,
      successNote: "Age verification required (18+)",
      btnFinal: "SEE PROFILES NOW",
      detailsText: "100% Verified Local Dating Network"
    },
    fr: {
      step1Title: `Découvrez des femmes mûres près de ${displayCity}`,
      step1Desc: "Quel genre de rencontres recherchez-vous?",
      btnAmateur: "Femmes Mûres Mariées",
      btnProfessional: "Femmes Mûres Célibataires",
      step2Title: "Avertissement de Discrétion",
      step2Desc: "Cet accès VIP aux profils locaux est confidentiel et privé.",
      step2Question: "Promettez-vous de garder l'identité de ces femmes secrète?",
      btnPromise: "OUI, JE LE PROMETS",
      loadingTitle: "Recherche de profils compatibles...",
      status1: `Analyse des profils actifs à ${displayCity}...`,
      status2: "Vérification de la disponibilité pour les rencontres d'aujourd'hui...",
      status3: "Filtrage des photos et vidéos privées non censurées...",
      status4: "Préparation de l'accès direct au chat local...",
      successTitle: "Femmes Mûres Trouvées!",
      successExpiry: "Votre accès VIP expire dans:",
      successDesc: `Vérification terminée ! Nous avons établi une connexion avec des profils réels et actifs près de chez vous à ${displayCity}. Pour protéger la vie privée des utilisatrices et pouvoir voir leurs vidéos intimes et les contacter, activez votre Pass d'Accès VIP en toute sécurité.`,
      successNote: "Vérification d'âge requise (18+)",
      btnFinal: "VOIR LES PROFILS MAINTENANT",
      detailsText: "Réseau de Rencontres Local 100% Vérifié"
    },
    ja: {
      step1Title: `${displayCity}近くの熟女を見つける`,
      step1Desc: "どのような出会いをお探しですか？",
      btnAmateur: "人妻",
      btnProfessional: "独身の熟女",
      step2Title: "機密保持の警告",
      step2Desc: "ローカルプロフィールへのこのVIPアクセスは機密であり、プライベートです。",
      step2Question: "これらの女性の身元を秘密にすることを約束しますか？",
      btnPromise: "はい、約束します",
      loadingTitle: "互換性のあるプロフィールを検索中...",
      status1: `${displayCity}のアクティブなプロフィールを分析中...`,
      status2: "今日の出会いの空き状況を確認中...",
      status3: "無修正のプライベートな写真とビデオをフィルタリング中...",
      status4: "ローカルチャットへの直接アクセスを準備中...",
      successTitle: "熟女が見つかりました！",
      successExpiry: "VIPアクセスの有効期限：",
      successDesc: `確認が完了しました！${displayCity}の近くのリアルでアクティブなプロフィールとつながりました。ユーザーのプライバシーを保護し、親密なビデオを見たり連絡を取ったりできるようにするには、VIPアクセスパスを安全に有効にしてください。`,
      successNote: "年齢確認が必要です (18歳以上)",
      btnFinal: "今すぐプロフィールを見る",
      detailsText: "100％検証済みのローカル出会い系ネットワーク"
    },
    it: {
      step1Title: `Scopri donne mature vicino a ${displayCity}`,
      step1Desc: "Che tipo di incontri stai cercando?",
      btnAmateur: "Donne Mature Sposate",
      btnProfessional: "Donne Mature Single",
      step2Title: "Avviso di Discrezione",
      step2Desc: "Questo accesso VIP ai profili locali è confidenziale e privato.",
      step2Question: "Prometti di mantenere segreta l'identità di queste donne?",
      btnPromise: "SÌ, LO PROMETTO",
      loadingTitle: "Ricerca di profili compatibili...",
      status1: `Analisi dei profili attivi a ${displayCity}...`,
      status2: "Verifica della disponibilità per gli incontri di oggi...",
      status3: "Filtraggio di foto e video privati senza censura...",
      status4: "Preparazione dell'accesso diretto alla chat locale...",
      successTitle: "Donne Mature Trovate!",
      successExpiry: "Il tuo accesso VIP scade tra:",
      successDesc: `Verifica completata! Ci siamo connessi con profili reali e attivi vicino a te a ${displayCity}. Per proteggere la privacy delle utenti e poter vedere i loro video intimi e contattarle, attiva il tuo Pass di Accesso VIP in modo sicuro.`,
      successNote: "Richiesta verifica dell'età (18+)",
      btnFinal: "VEDI PROFILI ORA",
      detailsText: "Rete di Incontri Locale Verificata al 100%"
    },
    pt: {
      step1Title: `Descubra mulheres maduras perto de ${displayCity}`,
      step1Desc: "Que tipo de encontros você está procurando?",
      btnAmateur: "Mulheres Maduras Casadas",
      btnProfessional: "Mulheres Maduras Solteiras",
      step2Title: "Aviso de Discrição",
      step2Desc: "Este acesso VIP a perfis locais é confidencial e privado.",
      step2Question: "Você promete manter em segredo a identidade dessas mulheres?",
      btnPromise: "SIM, EU PROMETO",
      loadingTitle: "Buscando perfis compatíveis...",
      status1: `Analisando perfis ativos em ${displayCity}...`,
      status2: "Verificando disponibilidade para encontros hoje...",
      status3: "Filtrando fotos e vídeos privados sem censura...",
      status4: "Preparando acesso direto ao bate-papo local...",
      successTitle: "Mulheres Maduras Encontradas!",
      successExpiry: "Seu acesso VIP expira em:",
      successDesc: `Verificação concluída! Nos conectamos com perfis reais e ativos perto de você em ${displayCity}. Para proteger a privacidade das usuárias e poder ver seus vídeos íntimos e contatá-las, ative seu Passe de Acesso VIP com segurança.`,
      successNote: "Verificação de idade necessária (18+)",
      btnFinal: "VER PERFIS AGORA",
      detailsText: "Rede de Encontros Local 100% Verificada"
    }
  };

  const t = dict[detectedLang] || dict.es;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!backgroundRef.current) return;
    const rect = backgroundRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    backgroundRef.current.style.setProperty("--mouse-x", `${x}px`);
    backgroundRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  useEffect(() => {
    if (step === 3) {
      setProgress(0);
      const duration = 1800; 
      const intervalTime = 30;
      const stepValue = 100 / (duration / intervalTime);

      const timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + stepValue;
          if (next >= 100) {
            clearInterval(timer);
            setStep(4);
            return 100;
          }
          
          if (next < 25) {
            setProgressText(t.status1);
          } else if (next < 60) {
            setProgressText(t.status2);
          } else if (next < 85) {
            setProgressText(t.status3);
          } else {
            setProgressText(t.status4);
          }

          return next;
        });
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [step, t.status1, t.status2, t.status3, t.status4]);

  useEffect(() => {
    if (step === 4 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="relative w-full min-h-screen bg-[#040406] text-white flex items-center justify-center overflow-hidden select-none font-sans">
      
      <div 
        ref={backgroundRef}
        onPointerMove={handlePointerMove}
        className="absolute inset-0 w-full h-full cursor-crosshair select-none"
        style={{
          "--mouse-x": "-999px",
          "--mouse-y": "-999px",
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 opacity-95 blur-[3px] scale-105 select-none pointer-events-none" aria-hidden="true">
          {tiles.map((tile) => (
            <div key={tile.id} className="relative rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden aspect-[4/3] flex flex-col justify-end p-4 shadow-inner">
              {tile.videoUrl ? (
                <video 
                  src={tile.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover saturate-150 contrast-125"
                />
              ) : (
                <img src={tile.img} alt={tile.title} className="absolute inset-0 w-full h-full object-cover saturate-150 contrast-125" />
              )}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/20 via-fuchsia-600/10 to-transparent pointer-events-none mix-blend-color-dodge z-[2]" />

        <div 
          className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 opacity-90 select-none pointer-events-none transition-opacity duration-300 z-[3]"
          style={{
            maskImage: "radial-gradient(circle 120px at var(--mouse-x) var(--mouse-y), black 0%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle 120px at var(--mouse-x) var(--mouse-y), black 0%, black 40%, transparent 100%)"
          }}
          aria-hidden="true"
        >
          {tiles.map((tile) => (
            <div key={tile.id} className="relative rounded-2xl bg-zinc-900 border border-white/15 overflow-hidden aspect-[4/3] flex flex-col justify-end p-3 shadow-2xl">
              {tile.videoUrl ? (
                <video 
                  src={tile.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.9] saturate-125"
                />
              ) : (
                <img src={tile.img} alt={tile.title} className="absolute inset-0 w-full h-full object-cover brightness-[0.9] saturate-125" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                <span className="bg-rose-500 text-white font-black text-[8px] px-1.5 py-0.5 rounded shadow-lg shadow-rose-500/30">
                  {tile.tag}
                </span>
                <span className="bg-black/60 backdrop-blur-sm text-[8px] font-bold text-emerald-400 px-1.5 py-0.5 rounded border border-white/10">
                  {tile.match} MATCH
                </span>
              </div>
              <div className="relative z-10 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-rose-500">
                  <Play className="w-3 h-3 fill-rose-500" />
                  <span className="text-[10px] font-black tracking-tight line-clamp-1 text-white">{tile.title}</span>
                </div>
                <div className="flex items-center gap-1 text-[8px] text-zinc-400">
                  <Users className="w-2.5 h-2.5" />
                  <span>{tile.views} viendo ahora</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] z-10 pointer-events-none" />

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[10px] text-zinc-200 shadow-xl">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>{t.detailsText}</span>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[10px] text-zinc-200 shadow-xl">
        {displayCountry && (
          <span className="text-sm leading-none" title={displayCountry}>
            {getFlagEmoji(displayCountry)}
          </span>
        )}
        <span className="font-semibold text-rose-400 uppercase tracking-wide">{displayCity}</span>
      </div>

      <div className="relative z-30 max-w-md w-[92%] p-[1px] bg-gradient-to-b from-zinc-700/30 to-zinc-900/10 rounded-[32px] border border-white/15 shadow-2xl backdrop-blur-xl">
        <div className="bg-[#101014]/95 rounded-[28px] p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden shadow-inner">
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-fuchsia-500/15 rounded-full blur-2xl pointer-events-none" />

          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="relative w-16 h-16 bg-rose-500/15 rounded-full flex items-center justify-center border border-rose-500/35 shadow-lg shadow-rose-500/10 animate-pulse">
                  <div className="absolute inset-0 rounded-full border border-rose-500/40 animate-ping opacity-30" />
                  <Lock className="w-7 h-7 text-rose-500 animate-pulse" />
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight leading-tight text-white">
                    {t.step1Title}
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                    {t.step1Desc}
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => setStep(2)}
                    className="group flex items-center justify-between w-full bg-zinc-950 hover:bg-zinc-900 border border-white/10 hover:border-rose-500/50 text-white font-bold py-3.5 px-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.99] hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
                  >
                    <span className="text-sm tracking-wide">{t.btnAmateur}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button 
                    onClick={() => setStep(2)}
                    className="group flex items-center justify-between w-full bg-zinc-950 hover:bg-zinc-900 border border-white/10 hover:border-rose-500/50 text-white font-bold py-3.5 px-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.99] hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
                  >
                    <span className="text-sm tracking-wide">{t.btnProfessional}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="relative w-16 h-16 bg-amber-500/15 rounded-full flex items-center justify-center border border-amber-500/35 shadow-lg animate-pulse">
                  <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-25" />
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    {t.step2Title}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight leading-tight text-white">
                    {t.step2Desc}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    {t.step2Question}
                  </p>
                </div>

                <div className="w-full pt-2">
                  <button 
                    onClick={() => setStep(3)}
                    className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-sm py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-rose-600/40 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 select-none border border-rose-500/30 uppercase tracking-widest relative overflow-hidden group animate-pulse focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <Zap className="w-4 h-4 fill-white" />
                    {t.btnPromise}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center gap-6 py-4"
              >
                <div className="relative w-16 h-16 bg-rose-500/15 rounded-full flex items-center justify-center border border-rose-500/35 shadow-lg shadow-rose-500/10">
                  <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {t.loadingTitle}
                  </h3>
                  <p className="text-xs text-rose-400 font-medium h-5 tracking-tight transition-all duration-150">
                    {progressText}
                  </p>
                </div>

                <div 
                  className="w-full bg-zinc-950 border border-white/10 rounded-full h-3.5 overflow-hidden p-[2px]"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={progressText}
                >
                  <motion.div 
                    className="h-full bg-gradient-to-r from-rose-600 to-fuchsia-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>
                
                <span className="text-[10px] font-mono font-black text-zinc-500 tracking-wider">
                  {Math.round(progress)}% COMPLETADO
                </span>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className="w-full flex flex-col items-center gap-5"
              >
                <div className="relative w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center border border-emerald-500/35 shadow-lg shadow-emerald-500/10">
                  <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-25" />
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black font-heading tracking-tight leading-none text-emerald-400">
                    {t.successTitle}
                  </h2>
                  <div className="flex items-center gap-1.5 justify-center mt-2.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {t.successExpiry}
                    </span>
                    <span className="font-mono text-sm font-black text-rose-500 animate-pulse bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed text-justify max-w-sm pt-1 border-t border-zinc-900">
                  {t.successDesc}
                </p>

                <div className="w-full flex flex-col gap-3 pt-2">
                  <button 
                    onClick={handleRedirect}
                    className="w-full bg-gradient-to-r from-rose-600 via-rose-500 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 text-white font-black text-sm py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(244,63,94,0.5)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-rose-400/20 tracking-wider relative overflow-hidden group select-none animate-glow focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <Sparkles className="w-4 h-4 fill-white animate-spin duration-[4000ms]" />
                    {t.btnFinal}
                  </button>
                  
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
                    {t.successNote}
                  </span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .group-hover\\:animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(244, 63, 94, 0.45);
          }
          50% {
            box-shadow: 0 0 35px rgba(244, 63, 94, 0.65);
          }
        }
        .animate-glow {
          animation: glow 2s infinite ease-in-out;
        }
      `}</style>

    </main>
  );
}
