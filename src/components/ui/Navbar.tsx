"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { Search, Flame, Award, Globe, Check, X, Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { translations, Language } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { SurpriseModal } from "@/components/ui/SurpriseModal";
import { DRTUBER_FALLBACK_VIDEOS } from "@/lib/drtuber_fallback";
import { translateTitle } from "@/lib/auto-tagger";

const LANG_DETAILS = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
  { id: "ja", label: "日本語" },
  { id: "it", label: "Italiano" },
  { id: "pt", label: "Português" },
] as const;

const SUGGESTED_TAGS = [
  { id: "amateur", labelKey: "cat_amateur" },
  { id: "milf", labelKey: "cat_milf" },
  { id: "latinas", labelKey: "cat_latinas" },
  { id: "ebony", labelKey: "cat_ebony" },
  { id: "anal", labelKey: "cat_anal" },
  { id: "caseros", labelKey: "cat_caseros" },
  { id: "webcams", labelKey: "cat_webcams" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  
  const [lang, setLang] = useQueryState("lang", {
    defaultValue: "es",
    shallow: false,
  });

  const [activeSort] = useQueryState("sort", {
    defaultValue: "latest",
  });

  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
    throttleMs: 400,
  });

  const [localSearch, setLocalSearch] = useState(search);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [hoveredSearchVideoId, setHoveredSearchVideoId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // Real-time autocomplete suggestions based on the user's typed input
  const videoSuggestions = localSearch.trim().length > 0
    ? DRTUBER_FALLBACK_VIDEOS.filter((v) => {
        const title = translateTitle(v.title, activeLang).toLowerCase();
        const categoryLabel = (t[`cat_${v.category}` as keyof typeof t] || v.category).toLowerCase();
        const query = localSearch.toLowerCase();
        return title.includes(query) || categoryLabel.includes(query) || v.tags?.some((t) => t.toLowerCase().includes(query));
      }).slice(0, 3)
    : DRTUBER_FALLBACK_VIDEOS.slice(0, 3);

  const suggestionsHeader = localSearch.trim().length > 0
    ? (activeLang === "es" ? "Videos encontrados" : activeLang === "ja" ? "見つかった動画" : "Videos Found")
    : (activeLang === "es" ? "Tendencias de hoy" : activeLang === "ja" ? "今日のトレンド" : "Trending Today");

  // Sync local input with URL parameter during render phase to avoid cascading effects
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    setSearch(val || null);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glassmorphism px-4 md:px-8 py-3 flex flex-col justify-center transition-all duration-300">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Hamburger Menu Icon for Mobile */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 md:hidden text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-all cursor-pointer shrink-0"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-rose-500" />
          </button>

          <Link href={`/?lang=${activeLang}`}>
            <Logo className="h-8" />
          </Link>
          
          {/* Navigation shortcuts */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground font-heading">
            <Link 
              href={`/?lang=${activeLang}&sort=trending`} 
              className={cn(
                "flex items-center gap-1.5 transition-colors py-1 px-3.5 rounded-full border border-transparent hover:text-white",
                pathname === "/" && activeSort === "trending"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold"
                  : "hover:bg-white/5"
              )}
            >
              <Flame className={cn("w-4 h-4", pathname === "/" && activeSort === "trending" ? "text-rose-400" : "text-rose-500")} /> 
              <span>{t.trending}</span>
            </Link>
            <Link 
              href={`/?lang=${activeLang}&sort=popular`} 
              className={cn(
                "flex items-center gap-1.5 transition-colors py-1 px-3.5 rounded-full border border-transparent hover:text-white",
                pathname === "/" && activeSort === "popular"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-bold"
                  : "hover:bg-white/5"
              )}
            >
              <Award className={cn("w-4 h-4", pathname === "/" && activeSort === "popular" ? "text-yellow-400" : "text-yellow-500")} /> 
              <span>{t.popular}</span>
            </Link>
            <Link 
              href={`/categories?lang=${activeLang}`} 
              className={cn(
                "py-1 px-3.5 rounded-full border border-transparent hover:text-white transition-colors",
                pathname === "/categories"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold"
                  : "hover:bg-white/5"
              )}
            >
              {t.categories}
            </Link>
            <Link 
              href={`/swipe?lang=${activeLang}`} 
              className={cn(
                "py-1 px-3.5 rounded-full border border-transparent hover:text-white transition-colors flex items-center gap-1",
                pathname === "/swipe"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold"
                  : "hover:bg-white/5"
              )}
            >
              <span>{t.swipeGame}</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Compact Search Bar (Desktop Only) */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={t.searchPlaceholder}
              className="w-36 md:w-56 bg-secondary border border-white/5 rounded-full px-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all font-sans"
            />
            <Search className="absolute right-3.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            
            {isFocused && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground block mb-2.5">
                  {activeLang === "es" ? "Búsquedas sugeridas" : activeLang === "ja" ? "推奨される検索" : "Suggested Searches"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSearchChange(t[tag.labelKey] || tag.id)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
                    >
                      {t[tag.labelKey] || tag.id}
                    </button>
                  ))}
                </div>

                 <div className="mt-4 border-t border-white/5 pt-3">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground block mb-2.5">
                    {suggestionsHeader}
                  </span>
                  <div className="flex flex-col gap-2">
                    {videoSuggestions.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground italic py-1 block">
                        {activeLang === "es" ? "No se encontraron videos" : activeLang === "ja" ? "動画が見つかりませんでした" : "No videos found"}
                      </span>
                    ) : (
                      videoSuggestions.map((video) => {
                        const isRowHovered = hoveredSearchVideoId === video.id;
                        const videoTitle = translateTitle(video.title, activeLang);
                        return (
                          <Link
                            key={video.id}
                            href={`/video/${video.id}?lang=${activeLang}`}
                            onMouseDown={() => {
                              window.location.href = `/video/${video.id}?lang=${activeLang}`;
                            }}
                            onMouseEnter={() => setHoveredSearchVideoId(video.id)}
                            onMouseLeave={() => setHoveredSearchVideoId(null)}
                            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-white/5 transition-all group/row"
                          >
                            <div className="relative w-12 h-7 rounded bg-zinc-900 overflow-hidden shrink-0 border border-white/5">
                              <Image
                                src={video.thumbnailUrl}
                                alt={videoTitle}
                                fill
                                unoptimized
                                className={cn(
                                  "object-cover transition-opacity duration-300",
                                  isRowHovered ? "opacity-0" : "opacity-100"
                                )}
                              />
                              {isRowHovered && (
                                <video
                                  src={video.videoPreviewUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground group-hover/row:text-white line-clamp-1 truncate flex-1 transition-colors">
                              {videoTitle}
                            </span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Icon */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="p-2 sm:hidden text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-all cursor-pointer shrink-0"
            aria-label="Buscar"
          >
            {isMobileSearchOpen ? (
              <X className="w-4.5 h-4.5 text-rose-500" />
            ) : (
              <Search className="w-4.5 h-4.5 text-rose-500" />
            )}
          </button>

          {/* Premium Dropdown Language Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 bg-secondary hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-full px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer font-heading shadow-md"
            >
              <Globe className="w-3.5 h-3.5 text-rose-500" />
              <span className="uppercase">{activeLang}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl py-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-heading">
                {LANG_DETAILS.map((l) => {
                  const isActive = activeLang === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        setLang(l.id);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left hover:bg-white/5 cursor-pointer",
                        isActive ? "text-rose-500 font-bold" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none font-mono tracking-wider shrink-0 transition-colors",
                          isActive
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                            : "bg-white/5 border-white/10 text-muted-foreground group-hover:text-white"
                        )}>
                          {l.id.toUpperCase()}
                        </span>
                        <span>{l.label}</span>
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Surprise Me Button (Desktop Only) */}
          <button 
            onClick={() => setIsSurpriseOpen(true)}
            className="hidden sm:block bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/5 hover:border-white/10 transition-all active:scale-95 shrink-0 font-heading"
          >
            🎲 {activeLang === "es" ? "Sorpréndeme" : activeLang === "ja" ? "お楽しみ" : "Surprise Me"}
          </button>

          {/* Action Button (Desktop Only) */}
          <button className="hidden sm:block bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-lg shadow-rose-500/20 active:scale-95 shrink-0 font-heading animate-glow">
            {t.goLive}
          </button>
        </div>
      </div>

      {/* Slide-down Mobile Search Input Panel */}
      {isMobileSearchOpen && (
        <div className="w-full pt-3 pb-1 sm:hidden animate-in slide-in-from-top duration-200 font-sans">
          <div className="relative w-full">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-secondary border border-white/10 rounded-full pl-4 pr-10 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
            />
            <Search className="absolute right-3.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          </div>
          
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleSearchChange(t[tag.labelKey] || tag.id)}
                className="text-[10px] font-semibold px-2 py-1 rounded bg-zinc-900 border border-white/5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
              >
                {t[tag.labelKey] || tag.id}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[80vw] bg-zinc-950/95 border-r border-white/5 p-6 flex flex-col gap-6 shadow-2xl md:hidden font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <Link href={`/?lang=${activeLang}`} onClick={() => setIsMenuOpen(false)}>
                  <Logo className="h-7" />
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-4 font-heading text-sm">
                <Link
                  href={`/?lang=${activeLang}&sort=trending`}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded-xl border border-transparent transition-all",
                    pathname === "/" && activeSort === "trending"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <Flame className={cn("w-4.5 h-4.5", pathname === "/" && activeSort === "trending" ? "text-rose-400" : "text-rose-500")} />
                  <span>{t.trending}</span>
                </Link>
                
                <Link
                  href={`/?lang=${activeLang}&sort=popular`}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded-xl border border-transparent transition-all",
                    pathname === "/" && activeSort === "popular"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-bold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <Award className={cn("w-4.5 h-4.5", pathname === "/" && activeSort === "popular" ? "text-yellow-400" : "text-yellow-500")} />
                  <span>{t.popular}</span>
                </Link>

                <Link
                  href={`/categories?lang=${activeLang}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded-xl border border-transparent transition-all",
                    pathname === "/categories"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className="w-4.5 text-center text-xs font-bold text-rose-500">#</span>
                  <span>{t.categories}</span>
                </Link>

                <Link
                  href={`/swipe?lang=${activeLang}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded-xl border border-transparent transition-all",
                    pathname === "/swipe"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <Flame className={cn("w-4.5 h-4.5", pathname === "/swipe" ? "text-rose-400" : "text-rose-550")} />
                  <span>{t.swipeGame}</span>
                </Link>
              </div>

              {/* Action CTAs */}
              <div className="mt-auto flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSurpriseOpen(true);
                  }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-white/5 transition-all font-heading"
                >
                  <span>🎲 {activeLang === "es" ? "Sorpréndeme" : activeLang === "ja" ? "お楽しみ" : "Surprise Me"}</span>
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all font-heading animate-glow"
                >
                  <span>{t.goLive}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Surprise Me Slot Machine Modal */}
      <SurpriseModal
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        lang={activeLang}
      />
    </header>
  );
}
