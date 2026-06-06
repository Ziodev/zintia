import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zintiavids.com";

// Helper to escape special XML characters
function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

// Helper to convert duration string (e.g. "18:16" or "1:10:05") to total seconds
function durationToSeconds(durationStr: string): number {
  if (!durationStr) return 600; // default to 10 minutes (600s)
  
  const parts = durationStr.split(":").map(Number);
  if (parts.some(isNaN)) return 600;
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }
  return 600;
}

export async function GET() {
  try {
    // 1. Fetch all published videos from PostgreSQL database
    const dbVideos = await prisma.video.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { published_at: "desc" },
    });

    // 2. Generate XML Body
    let xmlItems = "";
    
    for (const video of dbVideos) {
      const title = video.title;
      const description = `Mira el video ${title} gratis en alta definicion en la categoria ${video.category}. Disfruta de la mejor calidad.`;
      
      const loc = `${SITE_URL}/video/${video.id}`;
      const thumbnailLoc = video.thumbnailUrl;
      const playerLoc = video.embedUrl || video.videoPreviewUrl || "";
      const duration = durationToSeconds(video.duration);
      const publicationDate = (video.published_at || video.createdAt || new Date()).toISOString();

      const ratingHash = video.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const rating = ((ratingHash % 5) * 0.1 + 4.5).toFixed(1);

      xmlItems += `  <url>
    <loc>${escapeXml(loc)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailLoc)}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      <video:player_loc>${escapeXml(playerLoc)}</video:player_loc>
      <video:duration>${duration}</video:duration>
      <video:publication_date>${publicationDate}</video:publication_date>
      <video:rating>${rating}</video:rating>
      <video:family_friendly>no</video:family_friendly>
    </video:video>
  </url>\n`;
    }

    // 3. Assemble full XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${xmlItems}</urlset>`;

    // 4. Return XML response with cache control
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });

  } catch (error: any) {
    console.error("Failed to generate Video XML Sitemap:", error);
    
    // Return an empty valid sitemap on failure to prevent breaking crawler requests
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
</urlset>`;
    return new Response(errorXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}
