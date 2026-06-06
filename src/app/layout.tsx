import { Suspense } from "react";
import type { Metadata } from "next";
import { Outfit, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { PostHogProvider } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ExitIntentModal } from "@/components/ui/ExitIntentModal";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zintia Vids - Plataforma de Video de Alta Calidad",
  description: "Disfruta de la mejor experiencia de streaming de video premium en alta definición sin interrupciones y con rendimiento optimizado.",
  keywords: ["streaming", "video premium", "alta definición", "entretenimiento de adultos"],
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${inter.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <NuqsAdapter>
          <PostHogProvider>
            <Suspense fallback={<div className="h-14 w-full bg-zinc-900/10 animate-pulse border-b border-white/5" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-24">
              {children}
            </main>
            <Suspense fallback={null}>
              <StickyCTA />
            </Suspense>
            <Suspense fallback={null}>
              <ExitIntentModal />
            </Suspense>
          </PostHogProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
