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
import { FloatingPlaylist } from "@/components/ui/FloatingPlaylist";
import Link from "next/link";
import { headers } from "next/headers";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isPrelander = headersList.get("x-prelander") === "true";

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
        {/* Microsoft Clarity Tag */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x3dmiy9tnj");
          `}
        </Script>
        <NuqsAdapter>
          <PostHogProvider>
            {isPrelander ? (
              <main className="flex-1 w-full flex flex-col">
                {children}
              </main>
            ) : (
              <>
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
                          <li><Link href="/category/amateur" className="hover:text-white transition-colors">Amateur</Link></li>
                          <li><Link href="/category/milf" className="hover:text-white transition-colors">MILF</Link></li>
                          <li><Link href="/category/latinas" className="hover:text-white transition-colors">Latinas</Link></li>
                          <li><Link href="/category/ebony" className="hover:text-white transition-colors">Ebony</Link></li>
                          <li><Link href="/category/anal" className="hover:text-white transition-colors">Anal</Link></li>
                          <li><Link href="/category/webcams" className="hover:text-white transition-colors">Webcams</Link></li>
                          <li><Link href="/category/caseros" className="hover:text-white transition-colors">Caseros</Link></li>
                        </ul>
                      </nav>
                      <nav aria-label="Idiomas">
                        <h3 className="font-bold text-white text-sm mb-3">Idiomas</h3>
                        <ul className="space-y-1.5">
                          <li><Link href="/?lang=es" className="hover:text-white transition-colors">Español</Link></li>
                          <li><Link href="/?lang=en" className="hover:text-white transition-colors">English</Link></li>
                          <li><Link href="/?lang=fr" className="hover:text-white transition-colors">Français</Link></li>
                          <li><Link href="/?lang=pt" className="hover:text-white transition-colors">Português</Link></li>
                          <li><Link href="/?lang=it" className="hover:text-white transition-colors">Italiano</Link></li>
                          <li><Link href="/?lang=ja" className="hover:text-white transition-colors">日本語</Link></li>
                          <li><Link href="/?lang=sl" className="hover:text-white transition-colors">Slovenščina</Link></li>
                        </ul>
                      </nav>
                      <div>
                        <h3 className="font-bold text-white text-sm mb-3">Legal</h3>
                        <ul className="space-y-1.5">
                          <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                          <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                          <li><Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link></li>
                          <li><Link href="/2257" className="hover:text-white transition-colors">18 U.S.C. 2257</Link></li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-muted-foreground">
                      <p>© {new Date().getFullYear()} Zintia Vids. Todos los derechos reservados. Todos los modelos tenían 18+ años al momento de la filmación.</p>
                      <p>Contenido proporcionado por terceros. <Link href="/dmca" className="text-rose-400 hover:text-rose-300 transition-colors">DMCA / Reporte de abuso</Link></p>
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
                <Suspense fallback={null}>
                  <FloatingPlaylist />
                </Suspense>
              </>
            )}
          </PostHogProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
