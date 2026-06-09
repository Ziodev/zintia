"use client";

import { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { motion, AnimatePresence } from "framer-motion";
import { X, Video, ExternalLink } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import posthog from "posthog-js";
import { getMobideaLink } from "@/lib/utils";

const EXPIRES_IN: Record<Language, string> = {
  es: "La oferta expira en",
  en: "Offer expires in",
  fr: "L'offre expire dans",
  ja: "限定オファーの残り時間",
  it: "L'offerta scade in",
  pt: "A oferta expira em",
  sl: "Ponudba poteče čez",
};

const GEOLOCATION_DESCS: Record<Language, (count: number, location: string) => string> = {
  es: (count, loc) => `${count} Modelos en Vivo cerca de ${loc}`,
  en: (count, loc) => `${count} Live Models near ${loc}`,
  fr: (count, loc) => `${count} Modèles en direct près de ${loc}`,
  ja: (count, loc) => `${loc}付近 de ライブモデル ${count} 名`,
  it: (count, loc) => `${count} Modelle in diretta vicino a ${loc}`,
  pt: (count, loc) => `${count} Modelos ao vivo perto de ${loc}`,
  sl: (count, loc) => `${count} modelov v živo v bližini kraja ${loc}`,
};

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(true);
  const [lang] = useQueryState("lang", { defaultValue: "es" });

  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // Retrieve user location
  const geo = useGeoLocation();

  // Fluctuating models count (simulating nearby active cameras)
  const [modelCount, setModelCount] = useState(34);

  useEffect(() => {
    const interval = setInterval(() => {
      setModelCount((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        const next = prev + delta;
        return Math.max(30, Math.min(42, next));
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // 5-minute countdown timer (session-persisted)
  const [timeLeft, setTimeLeft] = useState<number>(300);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTime = sessionStorage.getItem("zintia_countdown_time");
    let initialTime = 300;

    if (storedTime) {
      const parsed = parseInt(storedTime, 10);
      if (!isNaN(parsed) && parsed > 0) {
        initialTime = parsed;
      }
    } else {
      sessionStorage.setItem("zintia_countdown_time", "300");
    }

    const initTimer = setTimeout(() => {
      setTimeLeft(initialTime);
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          sessionStorage.setItem("zintia_countdown_time", "300");
          return 300;
        }
        const next = prev - 1;
        sessionStorage.setItem("zintia_countdown_time", next.toString());
        return next;
      });
    }, 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCTAClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetUrl = getMobideaLink("sticky_cta");
    posthog.capture("sticky_cta_click", {
      language: activeLang,
      location_city: geo.city,
      target_url: targetUrl,
    });
    window.location.href = targetUrl;
  };

  const handleClose = () => {
    posthog.capture("sticky_cta_dismissed", {
      language: activeLang,
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        exit={{ y: 100, x: "-50%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 1 }}
        className="fixed bottom-4 left-1/2 z-40 w-[92%] max-w-lg bg-zinc-900/80 backdrop-blur-lg border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-2xl shadow-rose-500/10 gap-3 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
        aria-label="Limited Offer CTA"
      >
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/15 p-2 rounded-xl text-rose-500 shrink-0">
            <Video className="w-5 h-5 fill-rose-500/10 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              {t.webcamsTitle}
            </span>
            <span className="text-[10px] text-muted-foreground line-clamp-1 font-sans">
              {GEOLOCATION_DESCS[activeLang]
                ? GEOLOCATION_DESCS[activeLang](modelCount, geo.city)
                : `${modelCount} models near ${geo.city}`}
            </span>
            <span className="text-[9px] text-rose-400 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span>
                {EXPIRES_IN[activeLang] || EXPIRES_IN.es}: {formatTime(timeLeft)}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#"
            onClick={handleCTAClick}
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-rose-500/20 animate-glow focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
          >
            <span>{t.enter}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
            aria-label="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
