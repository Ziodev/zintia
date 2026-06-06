import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTags } from "@/lib/auto-tagger";

// Helper to format duration from seconds to MM:SS or HH:MM:SS
function formatDuration(secondsStr: string): string {
  const totalSeconds = parseInt(secondsStr, 10);
  if (isNaN(totalSeconds) || totalSeconds <= 0) return "10:00";
  
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  const formattedMins = mins.toString().padStart(2, "0");
  const formattedSecs = secs.toString().padStart(2, "0");
  
  if (hrs > 0) {
    return `${hrs}:${formattedMins}:${formattedSecs}`;
  }
  return `${mins}:${formattedSecs}`;
}

// Helper to generate deterministic views based on video ID
function generateViews(idStr: string): string {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const viewCount = Math.abs(hash % 900) + 100;
  return `${viewCount}K`;
}

// Helper to extract src from iframe embed code
function extractEmbedUrl(embedCode: string): string {
  if (!embedCode) return "";
  const match = embedCode.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : "";
}

// Helper to map CSV categories to site categories
function mapCategories(categoriesStr: string, title: string): string {
  const text = `${categoriesStr} ${title}`.toLowerCase();
  
  if (text.includes("anal")) return "anal";
  if (text.includes("milf") || text.includes("mature") || text.includes("madura") || text.includes("step mom") || text.includes("stepmom") || text.includes("bbw")) return "milf";
  if (text.includes("latin") || text.includes("latina") || text.includes("spanish") || text.includes("brazil") || text.includes("colombian") || text.includes("casero")) return "latinas";
  if (text.includes("webcam") || text.includes("cam") || text.includes("live") || text.includes("chat")) return "webcams";
  if (text.includes("homemade") || text.includes("outdoor") || text.includes("casero") || text.includes("pov")) return "caseros";
  if (text.includes("ebony") || text.includes("black") || text.includes("negra")) return "ebony";
  
  return "amateur"; // default fallback
}

// Helper to detect CSV delimiter
function detectDelimiter(headerLine: string): string {
  const delimiters = ["|", ";", ",", "\t"];
  let bestDelimiter = "|";
  let maxCount = -1;
  for (const d of delimiters) {
    const count = (headerLine.match(new RegExp("\\" + d, "g")) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = d;
    }
  }
  return bestDelimiter;
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.ADMIN_SECRET_KEY || "tu_secreto_aqui_para_ingesta_y_cron";
    
    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== secretKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Body Parameters
    const body = await req.json().catch(() => ({}));
    const csvUrl = body.csvUrl;
    
    if (!csvUrl) {
      return NextResponse.json({ error: "Missing 'csvUrl' in request body." }, { status: 400 });
    }

    // 3. Fetch CSV Content
    const response = await fetch(csvUrl);
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch CSV: Status ${response.status}` }, { status: 400 });
    }

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV is empty or missing rows." }, { status: 400 });
    }

    // 4. Parse Headers and Map Column Indexes
    const headerLine = lines[0];
    const delimiter = detectDelimiter(headerLine);
    const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase());

    const colIdx = {
      id: headers.findIndex(h => h === "id" || h === "video_id" || h === "movie_id" || h.includes("id")),
      title: headers.findIndex(h => h === "title" || h === "name" || h.includes("title")),
      categories: headers.findIndex(h => h === "categories" || h === "category" || h === "channels" || h.includes("categories")),
      duration: headers.findIndex(h => h === "duration" || h === "length" || h.includes("duration")),
      embedCode: headers.findIndex(h => h === "embed code" || h === "embed_code" || h === "embed" || h.includes("embed")),
      thumbnail: headers.findIndex(h => h === "main thumbnail" || h === "main_thumbnail" || h === "thumbnail" || h === "thumb" || h.includes("thumb")),
      preview: headers.findIndex(h => h === "preview url" || h === "preview_url" || h === "preview" || h.includes("preview")),
    };

    // Verify critical columns exist
    if (colIdx.id === -1 || colIdx.title === -1 || colIdx.thumbnail === -1) {
      return NextResponse.json({ 
        error: "CSV missing critical headers. Required: ID, Title, Main thumbnail.", 
        headersFound: headers 
      }, { status: 400 });
    }

    // 5. Parse Rows and Prepare Database Payload
    const videosToInsert = [];
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(delimiter).map(p => p.trim());
      
      // Skip incomplete rows
      if (parts.length < headers.length - 2) {
        skippedCount++;
        continue;
      }

      const rawId = parts[colIdx.id];
      const title = parts[colIdx.title];
      const rawCategories = colIdx.categories !== -1 ? parts[colIdx.categories] : "";
      const rawDuration = colIdx.duration !== -1 ? parts[colIdx.duration] : "";
      const rawEmbedCode = colIdx.embedCode !== -1 ? parts[colIdx.embedCode] : "";
      const rawThumbnail = parts[colIdx.thumbnail];
      const rawPreview = colIdx.preview !== -1 ? parts[colIdx.preview] : "";

      if (!rawId || !title || !rawThumbnail) {
        skippedCount++;
        continue;
      }

      // Formatting properties
      const id = rawId.toString();
      const cleanTitle = title;
      const duration = formatDuration(rawDuration);
      const views = generateViews(id);
      const category = mapCategories(rawCategories, title);
      const tags = extractTags(title, rawCategories);
      const thumbnailUrl = rawThumbnail.replace("http://", "https://");
      const videoPreviewUrl = rawPreview ? rawPreview.replace("http://", "https://") : "";
      const embedUrl = extractEmbedUrl(rawEmbedCode);

      videosToInsert.push({
        id,
        title: cleanTitle,
        duration,
        views,
        category,
        tags,
        thumbnailUrl,
        videoPreviewUrl,
        embedUrl: embedUrl || null,
        status: "DRAFT" as const,
      });
    }

    // 6. Bulk Insert in Batches of 500 using Prisma
    const batchSize = 500;
    let insertedCount = 0;

    for (let i = 0; i < videosToInsert.length; i += batchSize) {
      const chunk = videosToInsert.slice(i, i + batchSize);
      const result = await prisma.video.createMany({
        data: chunk,
        skipDuplicates: true, // Crucial to skip existing videos
      });
      insertedCount += result.count;
    }

    return NextResponse.json({
      success: true,
      totalRows: lines.length - 1,
      parsed: videosToInsert.length,
      inserted: insertedCount,
      duplicatesOrSkipped: (lines.length - 1) - insertedCount,
      corruptOrSkippedRows: skippedCount
    });

  } catch (error: any) {
    console.error("CSV Ingestion Error:", error);
    return NextResponse.json({ error: "Ingestion failed", details: error.message }, { status: 500 });
  }
}
