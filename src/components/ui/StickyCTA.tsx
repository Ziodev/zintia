"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { motion, AnimatePresence } from "framer-motion";
import { X, Video, ExternalLink } from "lucide-react";
import { translations, Language } from "@/lib/translations";

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(true);
  const [lang] = useQueryState("lang", { defaultValue: "es" });

  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        exit={{ y: 100, x: "-50%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 1 }}
        className="fixed bottom-4 left-1/2 z-40 w-[92%] max-w-lg bg-zinc-900/80 backdrop-blur-lg border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-2xl shadow-rose-500/10 gap-3"
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
            <span className="text-[10px] text-muted-foreground line-clamp-1">
              {t.webcamsDesc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://example.com/affiliate-link"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-rose-500/20"
          >
            <span>{t.enter}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
            aria-label="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
