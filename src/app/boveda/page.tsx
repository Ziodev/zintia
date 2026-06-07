import type { Metadata } from "next";
import { headers } from "next/headers";
import { BovedaClient } from "./BovedaClient";
import { SfwPage } from "./SfwPage";

// Completely SFW Metadata for Search Engines and Ad Network Bot Reviews
export const metadata: Metadata = {
  title: "Bóveda Secure - Encriptación Local de Archivos AES-256",
  description: "Encripta y protege tus archivos locales de forma rápida y segura en tu navegador. Tus datos nunca se suben al servidor. 100% privado.",
  keywords: ["encriptación", "seguridad local", "boveda segura", "aes-256", "seguridad de archivos"],
  robots: "noindex, nofollow", // Prevent organic indexing of pre-lander pages to keep campaigns clean
  openGraph: {
    title: "Bóveda Secure - Encriptación Local de Archivos AES-256",
    description: "Encriptación de archivos a nivel de cliente en segundos. 100% privado.",
    type: "website",
  }
};

export default async function BovedaPage() {
  const headersList = await headers();
  const country = headersList.get("x-user-country") || "ES";
  const rawCity = headersList.get("x-user-city") || "";
  const city = rawCity ? decodeURIComponent(rawCity) : (country === "ES" ? "tu área" : "your area");
  const isBot = headersList.get("x-is-bot") === "true";

  if (isBot) {
    return <SfwPage />;
  }

  return <BovedaClient country={country} city={city} isBot={isBot} />;
}
