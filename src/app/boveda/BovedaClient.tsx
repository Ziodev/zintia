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

interface BovedaClientProps {
  country: string;
  city: string;
  isBot: boolean;
}

// Beautiful, high-quality, SFW mock thumbnails for the background grid
const BACKGROUND_TILES = [
  {
    id: 1,
    title: "En Vivo: Sofia (21)",
    tag: "POPULAR",
    views: "14.2K",
    match: "98%",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=300&q=80"
  },
  {
    id: 2,
    title: "Casero: Estudiante Universitaria (20)",
    tag: "LOCAL",
    views: "9.8K",
    match: "95%",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=300&q=80"
  },
  {
    id: 3,
    title: "Privado: Valentina - Sesión VIP",
    tag: "EXCLUSIVE",
    views: "21.5K",
    match: "99%",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=300&q=80"
  },
  {
    id: 4,
    title: "Cámara HD: Camila & Laura",
    tag: "AMATEUR",
    views: "8.4K",
    match: "92%",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=300&q=80"
  },
  {
    id: 5,
    title: "Casero: Conexión en Vivo",
    tag: "RECENT",
    views: "5.1K",
    match: "89%",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=300&q=80"
  },
  {
    id: 6,
    title: "Transmisión Directa: Andrea (22)",
    tag: "TRENDING",
    views: "18.3K",
    match: "97%",
    img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&h=300&q=80"
  }
];

// Encrypted Affiliate Links (Base64)
const OBFUSCATED_URLS = {
  tier1: "aHR0cHM6Ly9wbGF5LmFkdWx0Zm9yY2UuY29tL3JlZGlyZWN0P3N1Yj1hZDUtcHJlbGFuZGVyLXRpZXIx", // Adult Force Link
  tier2: "aHR0cHM6Ly9pbW9uZXRpeml0LmNvbS9zbWFydGxpbms/c3ViPWFkNS1wcmVsYW5kZXItdGllcjI=", // iMonetizIt Link
  tier3: "aHR0cHM6Ly9sb3Nwb2xsb3MuY29tL3NtYXJ0bGluaz9zdWI9YWQ1LXByZWxhbmRlci10aWVyMw=="  // LosPollos/Backup Link
};

export function BovedaClient({ country, city, isBot }: BovedaClientProps) {
  const [step, setStep] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes countdown
  
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Decrypt and redirect based on geo tier
  const handleRedirect = () => {
    // Identify geographic tier
    const c = country.toUpperCase();
    
    // Tier 1 list: US, GB, CA, AU, NZ, DE, FR, JP
    const tier1Countries = ["US", "GB", "CA", "AU", "NZ", "DE", "FR", "JP"];
    
    // Tier 2 list (Spanish speaking countries)
    const tier2Countries = [
      "ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CR", "UY", "DO", "PR", "BO", "PY", "SV", "HN", "NI", "PA"
    ];

    let obfuscatedLink = OBFUSCATED_URLS.tier3; // default fallback
    if (tier1Countries.includes(c)) {
      obfuscatedLink = OBFUSCATED_URLS.tier1;
    } else if (tier2Countries.includes(c) || isSpanishSpeaking()) {
      obfuscatedLink = OBFUSCATED_URLS.tier2;
    }

    try {
      const targetUrl = atob(obfuscatedLink);
      window.location.href = targetUrl;
    } catch (e) {
      // Emergency fallback in case base64 decode fails
      window.location.href = "https://play.adultforce.com/redirect";
    }
  };

  const isSpanishSpeaking = () => {
    if (typeof window === "undefined") return true;
    const lang = window.navigator.language || "";
    return lang.toLowerCase().includes("es");
  };

  // Determine display language based on country/browser language
  const activeLang = isSpanishSpeaking() ? "es" : "en";

  // Content dictionary
  const dict = {
    es: {
      step1Title: `Se ha detectado una red segura en ${city}`,
      step1Desc: "¿Qué tipo de archivo deseas desencriptar?",
      btnAmateur: "Contenido Amateur",
      btnProfessional: "Estudio Profesional",
      step2Title: "Advertencia de Seguridad",
      step2Desc: "Este pase de cortesía VIP es personal e intransferible.",
      step2Question: "¿Prometes discreción absoluta?",
      btnPromise: "SÍ, LO PROMETO",
      loadingTitle: "Desencriptando Bóveda...",
      status1: `Sincronizando 14 servidores locales en ${city}...`,
      status2: "Evitando cortafuegos de red locales...",
      status3: "Encontrando transmisiones activas libres de anuncios...",
      status4: "Estableciendo túnel SSL seguro...",
      successTitle: "¡Acceso Concedido!",
      successExpiry: "Tu pase de acceso expira en:",
      successDesc: `¡Conexión Segura Establecida con Éxito! Hemos bloqueado los anuncios maliciosos y rastreadores para tu IP en ${city}. Para proteger la privacidad de la red y liberar los streams en Ultra-HD permanentemente, activa tu Pase de Acceso Gratuito de forma segura.`,
      successNote: "No se requiere tarjeta de crédito.",
      btnFinal: "INICIAR PRUEBA ULTRA-HD AHORA",
      detailsText: "Verificado por Red de Seguridad Local"
    },
    en: {
      step1Title: `Secure network detected in ${city === "your area" ? "your area" : city}`,
      step1Desc: "Which type of file do you wish to decrypt?",
      btnAmateur: "Amateur Feed",
      btnProfessional: "Professional Studio",
      step2Title: "Security Warning",
      step2Desc: "This VIP courtesy pass is personal and non-transferable.",
      step2Question: "Do you promise absolute discretion?",
      btnPromise: "YES, I PROMISE",
      loadingTitle: "Decrypting Vault...",
      status1: `Syncing 14 local servers in ${city === "your area" ? "your area" : city}...`,
      status2: "Bypassing network firewalls...",
      status3: "Locating active ad-free streams...",
      status4: "Establishing secure SSL tunnel...",
      successTitle: "Access Granted!",
      successExpiry: "Your access pass expires in:",
      successDesc: `Secure Connection Successfully Established! We have blocked malicious ads and trackers for your IP in ${city === "your area" ? "your area" : city}. To protect network privacy and unlock Ultra-HD streams permanently, activate your Free Access Pass securely.`,
      successNote: "No credit card required.",
      btnFinal: "START ULTRA-HD TRIAL NOW",
      detailsText: "Verified by Local Security Network"
    }
  };

  const t = dict[activeLang];

  // Track pointer movements to drive the lens overlay
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!backgroundRef.current) return;
    const rect = backgroundRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    backgroundRef.current.style.setProperty("--mouse-x", `${x}px`);
    backgroundRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  // Step 3: Fake loading progress animation
  useEffect(() => {
    if (step === 3) {
      setProgress(0);
      const duration = 1800; // 1.8 seconds total
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
          
          // Update status text based on progress
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

  // Step 4: Countdown timer logic
  useEffect(() => {
    if (step === 4 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full min-h-screen bg-[#060608] text-white flex items-center justify-center overflow-hidden select-none font-sans">
      
      {/* Background Interactive Blur Canvas */}
      <div 
        ref={backgroundRef}
        onPointerMove={handlePointerMove}
        className="absolute inset-0 w-full h-full cursor-crosshair select-none"
        style={{
          "--mouse-x": "-999px",
          "--mouse-y": "-999px",
        } as React.CSSProperties}
      >
        {/* Layer 1: Blurred Grid (SFW shapes & layout) */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 opacity-50 blur-xl scale-105 select-none pointer-events-none">
          {BACKGROUND_TILES.map((tile) => (
            <div key={tile.id} className="relative rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden aspect-[4/3] flex flex-col justify-end p-4">
              <img src={tile.img} alt={tile.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Layer 2: Unblurred Grid with Mask (Scratch reveal effect) */}
        <div 
          className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 opacity-75 select-none pointer-events-none transition-opacity duration-300"
          style={{
            maskImage: "radial-gradient(circle 120px at var(--mouse-x) var(--mouse-y), black 0%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle 120px at var(--mouse-x) var(--mouse-y), black 0%, black 40%, transparent 100%)"
          }}
        >
          {BACKGROUND_TILES.map((tile) => (
            <div key={tile.id} className="relative rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden aspect-[4/3] flex flex-col justify-end p-3 shadow-2xl">
              <img src={tile.img} alt={tile.title} className="absolute inset-0 w-full h-full object-cover brightness-[0.85]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                <span className="bg-rose-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow-lg shadow-rose-500/20">
                  {tile.tag}
                </span>
                <span className="bg-black/60 backdrop-blur-sm text-[8px] font-medium text-emerald-400 px-1.5 py-0.5 rounded border border-white/5">
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

      {/* Dark tint overlay for maximum readability of the modal */}
      <div className="absolute inset-0 bg-[#060608]/70 backdrop-blur-sm z-10 pointer-events-none" />

      {/* Floating security indicators */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 text-[10px] text-zinc-400 shadow-xl">
        <Shield className="w-3.5 h-3.5 text-rose-500" />
        <span>{t.detailsText}</span>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 text-[10px] text-zinc-400 shadow-xl">
        <MapPin className="w-3.5 h-3.5 text-rose-500" />
        <span className="font-semibold text-rose-400">{city}</span>
      </div>

      {/* Central Interactive Card (Modal) */}
      <div className="relative z-30 max-w-md w-[92%] p-1 bg-gradient-to-b from-zinc-700/25 to-zinc-900/10 rounded-[32px] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="bg-[#121216]/95 rounded-[28px] p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden shadow-inner">
          {/* Neon mesh gradient reflection */}
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />

          <AnimatePresence mode="wait">
            
            {/* Step 1: Preferences / Intention */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center gap-6"
              >
                {/* Safe lock animation header */}
                <div className="relative w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/5">
                  <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping opacity-25" />
                  <Lock className="w-7 h-7 text-rose-500" />
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
                    className="group flex items-center justify-between w-full bg-zinc-900 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 text-white font-bold py-3.5 px-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.99]"
                  >
                    <span className="text-sm tracking-wide">{t.btnAmateur}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>

                  <button 
                    onClick={() => setStep(2)}
                    className="group flex items-center justify-between w-full bg-zinc-900 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 text-white font-bold py-3.5 px-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg active:scale-[0.99]"
                  >
                    <span className="text-sm tracking-wide">{t.btnProfessional}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Warnings & Commit */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="relative w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 shadow-lg">
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
                    className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-sm py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-rose-600/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 select-none border border-rose-500/20 uppercase tracking-widest relative overflow-hidden group"
                  >
                    {/* Glowing effect inside button */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <Zap className="w-4 h-4 fill-white" />
                    {t.btnPromise}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Fake Decryption progress bar */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center gap-6 py-4"
              >
                <div className="relative w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/5">
                  <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {t.loadingTitle}
                  </h3>
                  {/* Status update ticker */}
                  <p className="text-xs text-rose-400 font-medium h-5 tracking-tight transition-all duration-150">
                    {progressText}
                  </p>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-zinc-900 border border-white/5 rounded-full h-3.5 overflow-hidden p-[2px]">
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

            {/* Step 4: Paywall / Final conversion trigger */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className="w-full flex flex-col items-center gap-5"
              >
                {/* Successful validation shield */}
                <div className="relative w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-25" />
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
                    <span className="font-mono text-sm font-black text-rose-500 animate-pulse bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/10">
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
                    className="w-full bg-gradient-to-r from-rose-600 via-rose-500 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 text-white font-black text-sm py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-rose-400/20 tracking-wider relative overflow-hidden group select-none animate-glow"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <Sparkles className="w-4 h-4 fill-white animate-spin duration-[4000ms]" />
                    {t.btnFinal}
                  </button>
                  
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                    {t.successNote}
                  </span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      
      {/* Styles for animation utility class helper */}
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
            box-shadow: 0 0 20px rgba(244, 63, 94, 0.4);
          }
          50% {
            box-shadow: 0 0 35px rgba(244, 63, 94, 0.6);
          }
        }
        .animate-glow {
          animation: glow 2s infinite ease-in-out;
        }
      `}</style>

    </div>
  );
}
