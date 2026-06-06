"use client";
import { useState, useEffect } from "react";

export interface GeoLocation {
  city: string;
  country: string;
  region: string;
  loaded: boolean;
}

const FALLBACK_SPANISH_CITIES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao"
];

export function useGeoLocation() {
  const [location, setLocation] = useState<GeoLocation>({
    city: "",
    country: "",
    region: "",
    loaded: false,
  });

  useEffect(() => {
    let active = true;

    async function fetchLocation() {
      try {
        // Fetch location data from ipapi.co
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("Failed to fetch location");
        const data = await res.json();
        if (active) {
          setLocation({
            city: data.city || "Madrid",
            country: data.country_name || "España",
            region: data.region || "Madrid",
            loaded: true,
          });
        }
      } catch (err) {
        console.warn("GeoIP lookup failed, using simulated fallback:", err);
        if (active) {
          let saved = localStorage.getItem("zintia_simulated_city");
          if (!saved) {
            const randomCity = FALLBACK_SPANISH_CITIES[Math.floor(Math.random() * FALLBACK_SPANISH_CITIES.length)];
            saved = randomCity;
            localStorage.setItem("zintia_simulated_city", randomCity);
          }
          setLocation({
            city: saved,
            country: "España",
            region: saved,
            loaded: true,
          });
        }
      }
    }

    fetchLocation();
    return () => {
      active = false;
    };
  }, []);

  return location;
}
