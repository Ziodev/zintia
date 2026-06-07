"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryState } from "nuqs";
import { ShieldAlert } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { Logo } from "@/components/ui/Logo";

export function AgeGate() {
  const [showGate, setShowGate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lang] = useQueryState("lang", { defaultValue: "es" });
  const [btnHovered, setBtnHovered] = useState(false);

  // Wait for client mount before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Check age verification in localStorage
    const isVerified = localStorage.getItem("zintia_age_verified");
    if (isVerified !== "true") {
      setShowGate(true);
    }
  }, [mounted]);

  // Prevent scroll when gate is active
  useEffect(() => {
    if (showGate) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showGate]);

  const handleConfirm = () => {
    localStorage.setItem("zintia_age_verified", "true");
    setShowGate(false);
  };

  const handleReject = () => {
    window.location.href = "https://www.google.com";
  };

  if (!showGate || !mounted) return null;

  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // Use createPortal to render directly on document.body,
  // escaping any parent stacking contexts from providers/wrappers
  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at center, rgba(10, 8, 12, 0.65) 0%, rgba(4, 4, 6, 0.85) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "1rem",
      }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-3xl shadow-2xl shadow-rose-500/5 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden animate-glow"
        style={{
          background: "linear-gradient(to bottom, rgba(15, 15, 20, 0.85), rgba(9, 9, 12, 0.95))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Background ambient glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

        {/* Zintia Vids Logo */}
        <div className="mb-8 scale-110">
          <Logo className="h-9" />
        </div>

        {/* Warning Shield Badge with double ring animation */}
        <div className="relative mb-6">
          {/* Outer glowing pulsing ring */}
          <div 
            className="absolute inset-0 rounded-full blur-md animate-pulse-slow" 
            style={{ backgroundColor: "rgba(244, 63, 94, 0.15)" }}
          />
          {/* Inner container */}
          <div 
            className="relative w-16 h-16 rounded-full flex items-center justify-center text-white border"
            style={{
              background: "linear-gradient(to top right, #f43f5e, #d946ef)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.3)",
            }}
          >
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>

        {/* Content */}
        <h2 id="age-gate-title" className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {t.ageGateTitle}
        </h2>
        <p id="age-gate-desc" className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-sm">
          {t.ageGateDesc}
        </p>

        {/* Actions */}
        <div className="mt-8 w-full flex flex-col items-center gap-4 relative z-10">
          <button
            onClick={handleConfirm}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              background: "transparent",
              border: btnHovered ? "2px solid #fb7185" : "2px solid #f43f5e",
              color: btnHovered ? "#ffffff" : "#f43f5e",
              boxShadow: btnHovered
                ? "0 0 20px rgba(244, 63, 94, 0.5), inset 0 0 20px rgba(244, 63, 94, 0.08)"
                : "0 0 10px rgba(244, 63, 94, 0.3)",
              transform: btnHovered ? "scale(1.02)" : "scale(1)",
              transition: "all 0.3s ease",
              maxWidth: "260px",
              width: "100%",
              padding: "12px 24px",
              borderRadius: "16px",
              fontWeight: 900,
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
            }}
            className="focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
          >
            {t.ageGateConfirm}
          </button>

          <button
            onClick={handleReject}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider underline underline-offset-4 cursor-pointer font-sans py-2 px-4 hover:bg-white/5 rounded-xl focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
          >
            {t.ageGateExit}
          </button>
        </div>

        {/* Legal Disclaimer Footer */}
        <p className="mt-6 text-[10px] text-zinc-600 leading-normal max-w-[280px]">
          {activeLang === "es" && "Al ingresar, confirmas que tienes al menos 18 años y aceptas nuestras Políticas de Cookies y Términos de Servicio."}
          {activeLang === "en" && "By entering, you confirm you are at least 18 years old and agree to our Cookie Policy and Terms of Service."}
          {activeLang === "fr" && "En entrant, vous confirmez que vous avez au moins 18 ans et acceptez nos conditions d'utilisation."}
          {activeLang === "ja" && "入場することで、18歳以上であることを確認し、利用規約に同意したものとみなされます。"}
          {activeLang === "it" && "Entrando confermi di avere almeno 18 anni e accetti i nostri Termini di Servizio."}
          {activeLang === "pt" && "Ao entrar, você confirma ter pelo menos 18 anos e concorda com os nossos Termos de Serviço."}
        </p>
      </div>
    </div>,
    document.body
  );
}

