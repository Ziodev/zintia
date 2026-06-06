import { useState, useEffect } from "react";
import { Language } from "@/lib/translations";

export interface GeoData {
  city: string;
  country: string;
}

const FALLBACKS: Record<Language, GeoData> = {
  es: { city: "Madrid", country: "España" },
  en: { city: "New York", country: "United States" },
  fr: { city: "Paris", country: "France" },
  ja: { city: "東京", country: "日本" },
  it: { city: "Roma", country: "Italia" },
  pt: { city: "Lisboa", country: "Portugal" },
};

export function useGeoLocation(lang: Language) {
  const [geo, setGeo] = useState<GeoData>(FALLBACKS[lang] || FALLBACKS.es);

  useEffect(() => {
    let active = true;

    fetch("https://ipapi.co/json/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch location");
        return res.json();
      })
      .then((data) => {
        if (active && data && data.city && data.country_name) {
          setGeo({
            city: data.city,
            country: data.country_name,
          });
        }
      })
      .catch((err) => {
        console.warn("Geolocation API unavailable, using localized fallback:", err.message);
        if (active) {
          setGeo(FALLBACKS[lang] || FALLBACKS.es);
        }
      });

    return () => {
      active = false;
    };
  }, [lang]);

  return geo;
}
