import { Suspense } from "react";
import type { Metadata } from "next";
import { Outfit, Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { PostHogProvider } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ExitIntentModal } from "@/components/ui/ExitIntentModal";
import { FakeChatBubble } from "@/components/ui/FakeChatBubble";
import { AgeGate } from "@/components/ui/AgeGate";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com"),
  title: "Zintia Vids - Plataforma de Video de Alta Calidad",
  description: "Disfruta de la mejor experiencia de streaming de video premium en alta definición sin interrupciones y con rendimiento optimizado.",
  keywords: ["streaming", "video premium", "alta definición", "entretenimiento de adultos"],
  other: {
    rating: "adult",
    "rta-5042-1996-1400-1577-rta": "RTA-5042-1996-1400-1577-RTA",
  }
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
      <head>
        <link rel="dns-prefetch" href="https://hctn.nv7s.com" />
        <link rel="dns-prefetch" href="https://hcpv2.nv7s.com" />
        <link rel="dns-prefetch" href="https://www.drtuber.com" />
        <link rel="preconnect" href="https://hctn.nv7s.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://hcpv2.nv7s.com" crossOrigin="anonymous" />
        {/* WebSite Schema — enables Google Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Zintia Vids",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com"}/?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Organization Schema — reinforces brand E-E-A-T */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Zintia Vids",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com"}/favicon.ico`,
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {/* Google Analytics Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XG2WYM519S"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XG2WYM519S');
          `}
        </Script>
        <NuqsAdapter>
          <PostHogProvider>
            <Suspense fallback={<div className="h-14 w-full bg-zinc-900/10 animate-pulse border-b border-white/5" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-24">
              {children}
            </main>
            {/* SEO Footer — internal links, semantic HTML, trust signals */}
            <footer className="w-full border-t border-white/5 bg-zinc-950/80 mt-auto">
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-muted-foreground">
                  <div>
                    <h3 className="font-bold text-white text-sm mb-3">Zintia Vids</h3>
                    <p className="leading-relaxed">Plataforma de streaming de video de alta calidad con contenido dinámico y rendimiento optimizado.</p>
                  </div>
                  <nav aria-label="Categorías">
                    <h3 className="font-bold text-white text-sm mb-3">Categorías</h3>
                    <ul className="space-y-1.5">
                      <li><a href="/?category=amateur" className="hover:text-white transition-colors">Amateur</a></li>
                      <li><a href="/?category=milf" className="hover:text-white transition-colors">MILF</a></li>
                      <li><a href="/?category=latinas" className="hover:text-white transition-colors">Latinas</a></li>
                      <li><a href="/?category=ebony" className="hover:text-white transition-colors">Ebony</a></li>
                      <li><a href="/?category=anal" className="hover:text-white transition-colors">Anal</a></li>
                      <li><a href="/?category=webcams" className="hover:text-white transition-colors">Webcams</a></li>
                      <li><a href="/?category=caseros" className="hover:text-white transition-colors">Caseros</a></li>
                    </ul>
                  </nav>
                  <nav aria-label="Idiomas">
                    <h3 className="font-bold text-white text-sm mb-3">Idiomas</h3>
                    <ul className="space-y-1.5">
                      <li><a href="/?lang=es" className="hover:text-white transition-colors">Español</a></li>
                      <li><a href="/?lang=en" className="hover:text-white transition-colors">English</a></li>
                      <li><a href="/?lang=fr" className="hover:text-white transition-colors">Français</a></li>
                      <li><a href="/?lang=pt" className="hover:text-white transition-colors">Português</a></li>
                      <li><a href="/?lang=it" className="hover:text-white transition-colors">Italiano</a></li>
                      <li><a href="/?lang=ja" className="hover:text-white transition-colors">日本語</a></li>
                    </ul>
                  </nav>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-3">Legal</h3>
                    <ul className="space-y-1.5">
                      <li><a href="/privacy" className="hover:text-white transition-colors">Privacidad</a></li>
                      <li><a href="/terms" className="hover:text-white transition-colors">Términos</a></li>
                      <li><a href="/dmca" className="hover:text-white transition-colors">DMCA</a></li>
                      <li><a href="/2257" className="hover:text-white transition-colors">18 U.S.C. 2257</a></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <p>© {new Date().getFullYear()} Zintia Vids. Todos los derechos reservados. Todos los modelos tenían 18+ años al momento de la filmación.</p>
                  <p>Contenido proporcionado por terceros. <a href="/dmca" className="text-rose-400 hover:text-rose-300 transition-colors">DMCA / Reporte de abuso</a></p>
                </div>
              </div>
            </footer>
            <Suspense fallback={null}>
              <StickyCTA />
            </Suspense>
            <Suspense fallback={null}>
              <ExitIntentModal />
            </Suspense>
            <FakeChatBubble />
            <Suspense fallback={null}>
              <AgeGate />
            </Suspense>
          </PostHogProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
