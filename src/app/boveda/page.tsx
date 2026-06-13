import type { Metadata } from "next";
import { headers } from "next/headers";
import { BovedaClient } from "./BovedaClient";
import { InteractiveVaultClient } from "./InteractiveVaultClient";
import { SfwPage } from "./SfwPage";
import { getVideos } from "@/lib/feed";

// Completely SFW Metadata for Search Engines and Ad Network Bot Reviews
export const metadata: Metadata = {
  title: "Bóveda Secure - Encriptación Local de Archivos AES-256",
  description: "Encripta y protege tus archivos locales de forma rápida y segura en tu navegador. Tus datos nunca se suben al servidor. 100% privado.",
  keywords: ["encriptación", "seguridad local", "boveda segura", "aes-256", "seguridad de archivos"],
  robots: "noindex, nofollow", // Prevent organic indexing of pre-lander pages to keep campaigns clean
  openGraph: {
    title: "Bóveda Secure - Encriptación Local de Archivos AES-256",
    description: "Encriptación de archivos a nivel de client en segundos. 100% privado.",
    type: "website",
  }
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BovedaPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const click = typeof resolvedSearchParams.beMobTok === "string"
    ? resolvedSearchParams.beMobTok
    : (typeof resolvedSearchParams.cid === "string"
      ? resolvedSearchParams.cid
      : (typeof resolvedSearchParams.click === "string" ? resolvedSearchParams.click : undefined));
  const zona = typeof resolvedSearchParams.zona === "string" ? resolvedSearchParams.zona : undefined;

  const headersList = await headers();
  const country = headersList.get("x-user-country") || "ES";
  const rawCity = headersList.get("x-user-city") || "";
  const city = rawCity ? decodeURIComponent(rawCity) : (country === "ES" ? "tu área" : "your area");
  const isBot = headersList.get("x-is-bot") === "true";

  if (isBot) {
    return <SfwPage />;
  }

  // Fetch real videos from the DB (with static fallbacks)
  const allVideos = await getVideos();
  const initialVideos = allVideos.slice(0, 6);

  // A/B Test Variant (50/50 split)
  // Optionally support forced variant via URL param for testing
  const forcedVariant = typeof resolvedSearchParams.v === "string" ? resolvedSearchParams.v : undefined;
  const variant = forcedVariant === "A" || forcedVariant === "B" 
    ? forcedVariant 
    : (Math.random() > 0.5 ? "A" : "B");

  if (variant === "B") {
    return (
      <InteractiveVaultClient
        country={country} 
        city={city} 
        isBot={isBot} 
        clickId={click} 
        zoneId={zona} 
        initialVideos={initialVideos}
        variant={variant as "A" | "B"}
      />
    );
  }

  return (
    <BovedaClient 
      country={country} 
      city={city} 
      isBot={isBot} 
      clickId={click} 
      zoneId={zona} 
      initialVideos={initialVideos}
    />
  );
}

