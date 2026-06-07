import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We only run this logic for the /boveda route
  if (pathname.startsWith("/boveda")) {
    const ua = request.headers.get("user-agent") || "";
    
    // Bot detection logic (User-Agents typically used by crawlers, audit bots, and serverless scripts)
    const botKeywords = [
      "googlebot",
      "bingbot",
      "slurp",
      "duckduckgo",
      "yandex",
      "baiduspider",
      "sogou",
      "exabot",
      "facebot",
      "ia_archiver",
      "lighthouse",
      "chrome-lighthouse",
      "pingdom",
      "gtmetrix",
      "screaming frog",
      "headless",
      "puppeteer",
      "selenium",
      "playwright",
      "cypress",
      "curl",
      "wget",
      "python",
      "go-http-client",
      "urllib",
      "axios",
      "node-fetch",
    ];

    const isBot = botKeywords.some((keyword) =>
      ua.toLowerCase().includes(keyword)
    ) || ua.length < 10;

    // Geo detection logic
    const acceptLanguage = request.headers.get("accept-language") || "";
    const isSpanish = acceptLanguage.toLowerCase().includes("es");

    // Retrieve geo info from Vercel headers or default
    const reqGeo = (request as any).geo;
    const country =
      reqGeo?.country ||
      request.headers.get("x-vercel-ip-country") ||
      (isSpanish ? "ES" : "US");

    const city =
      reqGeo?.city ||
      request.headers.get("x-vercel-ip-city") ||
      (isSpanish ? "tu área" : "your area");

    // Clone request headers to inject parameters
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-prelander", "true");
    requestHeaders.set("x-user-country", country);
    requestHeaders.set("x-user-city", encodeURIComponent(city));
    requestHeaders.set("x-is-bot", isBot ? "true" : "false");

    // Return response with custom request headers so RSC can consume them
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Also set them on response headers for browser/caching completeness
    response.headers.set("x-prelander", "true");
    response.headers.set("x-user-country", country);
    response.headers.set("x-user-city", encodeURIComponent(city));
    response.headers.set("x-is-bot", isBot ? "true" : "false");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/boveda/:path*", "/boveda"],
};
