"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { Search, Flame, Award, Globe, Check, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { translations, Language } from "@/lib/translations";
import { cn } from "@/lib/utils";

const LANG_DETAILS = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
  { id: "ja", label: "日本語" },
  { id: "it", label: "Italiano" },
  { id: "pt", label: "Português" },
] as const;

export function Navbar() {
  const [lang, setLang] = useQueryState("lang", {
    defaultValue: "es",
    shallow: false,
  });

  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
    throttleMs: 400,
  });

  const [localSearch, setLocalSearch] = useState(search);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = (lang as Language) || "es";
  const t = translations[activeLang] || translations.es;

  // Sync local input with URL parameter
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

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
        <div className="flex items-center gap-6">
          <Link href={`/?lang=${activeLang}`}>
            <Logo className="h-8" />
          </Link>
          
          {/* Navigation shortcuts */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground font-heading">
            <Link href={`/?lang=${activeLang}&sort=trending`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Flame className="w-4 h-4 text-rose-500" /> {t.trending}
            </Link>
            <Link href={`/?lang=${activeLang}&sort=popular`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Award className="w-4 h-4 text-yellow-500" /> {t.popular}
            </Link>
            <Link href={`/categories?lang=${activeLang}`} className="hover:text-white transition-colors">
              {t.categories}
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
              placeholder={t.searchPlaceholder}
              className="w-36 md:w-56 bg-secondary border border-white/5 rounded-full px-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all font-sans"
            />
            <Search className="absolute right-3.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
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

          {/* Action Button (Desktop Only) */}
          <button className="hidden sm:block bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-lg shadow-rose-500/20 active:scale-95 shrink-0 font-heading animate-glow">
            {t.goLive}
          </button>
        </div>
      </div>

      {/* Slide-down Mobile Search Input Panel */}
      {isMobileSearchOpen && (
        <div className="w-full pt-3 pb-1 sm:hidden animate-in slide-in-from-top duration-200">
          <div className="relative w-full">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-secondary border border-white/10 rounded-full pl-4 pr-10 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-sans"
            />
            <Search className="absolute right-3.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>
      )}
    </header>
  );
}
