"use client";

import { useEffect, useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { Language } from "@/lib/translations";
import { getMobideaLink } from "@/lib/utils";

const messages: Record<Language, { name: string; text: string; cta: string }> = {
  es: {
    name: "Sofía (21)",
    text: "¡Hola! Estoy online en mi webcam ahora mismo y no tengo a nadie en mi sala. ¿Quieres entrar a verme? ❤️",
    cta: "Chatear ahora"
  },
  en: {
    name: "Chloe (21)",
    text: "Hey! I'm live on my webcam right now and my room is empty. Want to join and watch me? ❤️",
    cta: "Chat now"
  },
  fr: {
    name: "Léa (20)",
    text: "Salut ! Je suis en direct sur ma webcam en ce moment et mon salon est vide. Tu veux me rejoindre ? ❤️",
    cta: "Chatter maintenant"
  },
  ja: {
    name: "結衣 (22)",
    text: "ねえ！今ウェブカメラで配信中なんだけど、誰もいなくて寂しいの。私に会いに来ない？❤️",
    cta: "今すぐチャット"
  },
  it: {
    name: "Giulia (21)",
    text: "Ciao! Sono in diretta sulla mia webcam in questo momento e la mia stanza è vuota. Vuoi entrare a vedermi? ❤️",
    cta: "Chatta ora"
  },
  pt: {
    name: "Beatriz (22)",
    text: "Oi! Estou ao vivo na minha webcam agora e minha sala está vazia. Quer entrar e me ver? ❤️",
    cta: "Conversar agora"
  }
};

const avatars: Record<Language, string> = {
  es: "https://pics.drtuber.com/media/videos/tmb/10091385/preview/12.jpg",
  en: "https://pics.drtuber.com/media/videos/tmb/10076122/preview/1.jpg",
  fr: "https://pics.drtuber.com/media/videos/tmb/10080826/preview/4.jpg",
  ja: "https://pics.drtuber.com/media/videos/tmb/10091425/preview/10.jpg",
  it: "https://pics.drtuber.com/media/videos/tmb/10074211/preview/2.jpg",
  pt: "https://pics.drtuber.com/media/videos/tmb/10072044/preview/5.jpg"
};

export function FakeChatBubble() {
  const [lang, setLang] = useState<Language>("es");
  const [showBubble, setShowBubble] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  useEffect(() => {
    // Check if dismissed in this session
    const isClosed = sessionStorage.getItem("fake_chat_closed") === "true";
    if (isClosed) return;

    // Show bubble after 10 seconds and determine language asynchronously
    const timer = setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const l = urlParams.get("lang") as Language;
      if (l && Object.keys(messages).includes(l)) {
        setLang(l);
      }
      setShowBubble(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBubble(false);
    sessionStorage.setItem("fake_chat_closed", "true");
  };

  const handleChatClick = () => {
    setUnreadCount(0);
    window.open(getMobideaLink("fake_chat_bubble"), "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleChatClick();
    }
  };

  if (!showBubble) return null;

  const currentMsg = messages[lang] || messages.es;
  const currentAvatar = avatars[lang] || avatars.es;

  return (
    <aside 
      className="fixed bottom-20 left-4 z-50 max-w-[320px] w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 duration-500 font-sans"
      aria-label="Live Chat Notification"
    >
      <div 
        role="button"
        tabIndex={0}
        onClick={handleChatClick}
        onKeyDown={handleKeyDown}
        className="relative flex flex-col bg-zinc-950/95 border border-rose-500/25 shadow-[0_8px_32px_rgba(244,63,94,0.15)] rounded-2xl p-4 cursor-pointer hover:border-rose-500/40 hover:shadow-[0_12px_40px_rgba(244,63,94,0.25)] transition-all duration-300 group overflow-hidden focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
      >
        {/* Decorative glassmorphic background layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

        {/* Header with Close and Status */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">
              {lang === "es" ? "En vivo" : lang === "ja" ? "配信中" : "Live"}
            </span>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 text-muted-foreground hover:text-white hover:bg-white/5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none focus:outline-none"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 relative z-10">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-rose-500/30 bg-zinc-800">
              <Image 
                src={currentAvatar} 
                alt="Model Avatar" 
                width={44} 
                height={44}
                unoptimized
                className="object-cover w-full h-full object-top group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white border-2 border-zinc-950 animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Text Message */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-white tracking-wide">
              {currentMsg.name}
            </span>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              {currentMsg.text}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-3.5 pt-2 border-t border-white/5 relative z-10 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <ShieldAlert className="w-3 h-3 text-rose-500/60" /> {lang === "es" ? "Conexión segura" : "Secure connection"}
          </span>
          <span className="text-xs font-extrabold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-0.5">
            {currentMsg.cta}
          </span>
        </div>
      </div>
    </aside>
  );
}
