import { getVideos } from "@/lib/feed";
import { SwipeGameClient } from "./SwipeGameClient";
import { Language } from "@/lib/translations";

interface SwipePageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function SwipePage({ searchParams }: SwipePageProps) {
  const resolvedSearchParams = await searchParams;
  const activeLang = (resolvedSearchParams.lang as Language) || "es";
  const videos = await getVideos();
  
  // Shuffle videos and pick 15 for a fresh gameplay round
  const shuffledVideos = [...videos].sort(() => Math.random() - 0.5).slice(0, 15);

  return (
    <div className="flex flex-col gap-6 py-6 items-center w-full">
      <SwipeGameClient initialVideos={shuffledVideos} lang={activeLang} />
    </div>
  );
}
