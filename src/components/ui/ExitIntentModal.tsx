"use client";

import { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { Gift, X, ExternalLink } from "lucide-react";
import { Language } from "@/lib/translations";
import posthog from "posthog-js";
import { getMobideaLink } from "@/lib/utils";

const EXIT_COPIES: Record<Language, { title: string; desc: string; button: string; close: string }> = {
  es: {
    title: "¿Te vas tan rápido?",
    desc: "🎁 Tienes [1] Pase VIP Premium para ver Modelos Privadas por 5 minutos.",
    button: "Reclamar Pase VIP Premium",
    close: "No, gracias. Continuar al sitio.",
  },
  en: {
    title: "Leaving so soon?",
    desc: "🎁 You have [1] Premium VIP Pass to watch Private Models for 5 minutes.",
    button: "Claim Premium VIP Pass",
    close: "No, thanks. Continue to site.",
  },
  fr: {
    title: "Vous partez déjà?",
    desc: "🎁 Vous avez [1] Pass VIP Premium pour regarder des Modèles Privés pendant 5 minutes.",
    button: "Réclamer le Pass VIP Premium",
    close: "Non, merci. Retour au site.",
  },
  ja: {
    title: "もうお帰りですか？",
    desc: "🎁 プライベートモデルを5分間視聴できる「プレミアムVIPパス」を1枚プレゼント！",
    button: "プレミアムVIPパスを受け取る",
    close: "いいえ、戻ります",
  },
  it: {
    title: "Te ne vai così presto?",
    desc: "🎁 Hai [1] Pass VIP Premium per guardare modelle private per 5 minuti.",
    button: "Richiedi il pass VIP Premium",
    close: "No, grazie. Continua al sito.",
  },
  pt: {
    title: "Já vai embora?",
    desc: "🎁 Você tem [1] Passe VIP Premium para ver Modelos Privados por 5 minutos.",
    button: "Reclamar Passe VIP Premium",
    close: "Não, obrigado. Voltar ao site.",
  },
  sl: {
    title: "Tako hitro odhajate?",
    desc: "🎁 Imate [1] Premium VIP prepustnico za 5-minutni ogled zasebnih modelov.",
    button: "Prevzemi Premium VIP prepustnico",
    close: "Ne, hvala. Nadaljuj na spletno mesto.",
  },
  da: {
    title: "Smutter du allerede?",
    desc: "🎁 Du har [1] Premium VIP-pas til at se private modeller i 5 minutter.",
    button: "Få Premium VIP-pas",
    close: "Nej tak. Fortsæt til hjemmesiden.",
  },
};

export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const activeLang = (lang as Language) || "es";
  const copy = EXIT_COPIES[activeLang] || EXIT_COPIES.es;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isModalShown = sessionStorage.getItem("zintia_exit_modal_shown");
    if (isModalShown === "true") return;

    const triggerModal = () => {
      setIsOpen(true);
      sessionStorage.setItem("zintia_exit_modal_shown", "true");
      posthog.capture("exit_intent_impression", {
        language: activeLang,
        page_url: window.location.href,
      });
    };

    // 1. Desktop Trigger: Cursor exits top border
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 50) {
        triggerModal();
      }
    };

    // 2. Mobile Trigger: Browser back button intercept
    window.history.pushState({ exitIntent: true }, "", window.location.href);

    const handlePopState = () => {
      triggerModal();
      window.history.pushState({ exitIntent: true }, "", window.location.href);
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [activeLang]);

  if (!isOpen) return null;

  const handleClaim = () => {
    const targetUrl = getMobideaLink("exit_intent_modal");
    posthog.capture("exit_intent_claimed", {
      language: activeLang,
      target_url: targetUrl,
    });
    window.location.href = targetUrl;
    setIsOpen(false);
  };

  const handleClose = () => {
    posthog.capture("exit_intent_dismissed", {
      language: activeLang,
    });
    setIsOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      aria-describedby="exit-modal-desc"
    >
      {/* Dialog box */}
      <div className="bg-zinc-900/90 border border-rose-500/20 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button X */}
        <button
          onClick={handleClose}
          className="absolute top-4.5 right-4.5 text-muted-foreground hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gift Icon */}
        <div className="bg-rose-500/10 text-rose-500 p-4 rounded-full mb-4.5 animate-bounce">
          <Gift className="w-7 h-7" />
        </div>

        {/* Headers */}
        <h2 id="exit-modal-title" className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-fuchsia-500 mb-2 font-heading tracking-tight leading-normal">
          {copy.title}
        </h2>
        <p id="exit-modal-desc" className="text-xs text-muted-foreground mb-6.5 leading-relaxed font-sans px-2">
          {copy.desc}
        </p>

        {/* Claim VIP Button */}
        <button
          onClick={handleClaim}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-rose-500/20 font-heading text-xs uppercase tracking-wider animate-glow cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
        >
          <span>{copy.button}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* Cancel Text */}
        <button
          onClick={handleClose}
          className="mt-4 text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer font-sans font-medium hover:underline focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none rounded"
        >
          {copy.close}
        </button>
      </div>
    </div>
  );
}
