"use client";

import { useGeoLocation } from "@/hooks/useGeoLocation";
import { Language } from "@/lib/translations";
import { MapPin } from "lucide-react";

interface HomeHeaderProps {
  activeLang: Language;
  titleText: string;
  liveLabel: string;
  exploreText: string;
}

const LOCALIZED_COPIES = {
  es: {
    trendsIn: "Tendencias más calientes en",
    activeNow: "usuarios activos ahora",
  },
  en: {
    trendsIn: "Hottest trends in",
    activeNow: "active users now",
  },
  fr: {
    trendsIn: "Tendances les plus chaudes à",
    activeNow: "utilisateurs actifs maintenant",
  },
  ja: {
    trendsIn: "の急上昇動画",
    activeNow: "人が視聴中",
  },
  it: {
    trendsIn: "Tendenze più calde a",
    activeNow: "utenti attivi ora",
  },
  pt: {
    trendsIn: "Tendências mais quentes em",
    activeNow: "usuários ativos agora",
  },
};

export function HomeHeader({ activeLang, titleText, liveLabel, exploreText }: HomeHeaderProps) {
  const { city, country, loaded } = useGeoLocation();
  const copies = LOCALIZED_COPIES[activeLang] || LOCALIZED_COPIES.es;

  // Calculate stable active user count based on city name hash
  const cityHash = city ? city.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 100;
  const activeUsers = (cityHash % 800) + 1200;

  return (
    <div className="flex flex-col gap-2 font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 font-heading">
          {titleText}
          <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-rose-500/20">
            {liveLabel}
          </span>
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          {exploreText}
        </p>

        {/* Localized GeoIP Banner */}
        {loaded && city && (
          <div className="mt-1.5 self-start">
            <div className="bg-rose-500/10 text-rose-400 border border-rose-500/10 hover:border-rose-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 tracking-wide transition-all shadow-lg shadow-rose-500/5 select-none hover:bg-rose-500/15">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="leading-none text-[10px] md:text-xs">
                {activeLang === "ja" ? (
                  <>
                    <strong className="text-white font-extrabold">{city} ({country})</strong>{copies.trendsIn} • {activeUsers.toLocaleString()} {copies.activeNow}
                  </>
                ) : (
                  <>
                    {copies.trendsIn} <strong className="text-white font-extrabold">{city}, {country}</strong> • {activeUsers.toLocaleString()} {copies.activeNow}
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
