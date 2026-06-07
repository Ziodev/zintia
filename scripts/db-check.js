/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking database video contents...\n");
  try {
    const totalCount = await prisma.video.count();
    const publishedCount = await prisma.video.count({ where: { status: "PUBLISHED" } });
    const draftCount = await prisma.video.count({ where: { status: "DRAFT" } });
    
    console.log(`Total Videos in DB: ${totalCount}`);
    console.log(`PUBLISHED Videos: ${publishedCount}`);
    console.log(`DRAFT Videos: ${draftCount}`);
    
    // Group by category
    const catStats = await prisma.video.groupBy({
      by: ['category'],
      _count: { id: true }
    });
    console.log("\nVideos by Category:");
    catStats.forEach(stat => {
      console.log(` - ${stat.category}: ${stat._count.id} videos`);
    });
    
    // Find duplicate titles
    console.log("\nChecking for duplicate video titles...");
    const duplicateTitles = await prisma.$queryRaw`
      SELECT title, COUNT(*) as count 
      FROM "Video" 
      GROUP BY title 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC 
      LIMIT 10;
    `;
    console.log(duplicateTitles);
    
    // Find duplicate thumbnails
    console.log("\nChecking for duplicate thumbnails...");
    const duplicateThumbs = await prisma.$queryRaw`
      SELECT "thumbnailUrl", COUNT(*) as count 
      FROM "Video" 
      GROUP BY "thumbnailUrl" 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC 
      LIMIT 10;
    `;
    console.log(duplicateThumbs);

    // Latest 5 published videos
    console.log("\nLatest 5 published videos:");
    const latestPublished = await prisma.video.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { published_at: "desc" },
      take: 5
    });
    latestPublished.forEach(v => {
      console.log(` - [${v.id}] ${v.title} (${v.published_at})`);
    });

  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
