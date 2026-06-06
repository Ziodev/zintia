import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.ADMIN_SECRET_KEY || "tu_secreto_aqui_para_ingesta_y_cron";
    
    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== secretKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch oldest 4 drafts
    const drafts = await prisma.video.findMany({
      where: { status: "DRAFT" },
      take: 4,
      orderBy: { createdAt: "asc" },
    });

    if (drafts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No drafts found to publish.", 
        published: [] 
      });
    }

    const ids = drafts.map(d => d.id);
    const publishDate = new Date();

    // 3. Mark as PUBLISHED and set published_at
    await prisma.video.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "PUBLISHED",
        published_at: publishDate,
      },
    });

    // 4. Purge home page ISR cache
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: `Successfully published ${drafts.length} videos.`,
      published: drafts.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        publishedAt: publishDate,
      })),
    });

  } catch (error: any) {
    console.error("Drip-feed Publish Cron Error:", error);
    return NextResponse.json({ error: "Publish failed", details: error.message }, { status: 500 });
  }
}
