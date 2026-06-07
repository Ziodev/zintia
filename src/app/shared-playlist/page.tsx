import { Metadata } from "next";
import { getVideoById } from "@/lib/feed";
import { Video } from "@/lib/data";
import { Language } from "@/lib/translations";
import { SharedPlaylistClient } from "./SharedPlaylistClient";

interface PageProps {
  searchParams: Promise<{ lang?: string; playlist?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";

  const titles: Record<Language, string> = {
    es: "Match de Compatibilidad Caliente 💋 | Zintia Vids",
    en: "Hot Compatibility Match 💋 | Zintia Vids",
    fr: "Test de Compatibilité Chaude 💋 | Zintia Vids",
    ja: "好みの相性診断 💋 | Zintia Vids",
    it: "Test Compatibilità Calda 💋 | Zintia Vids",
    pt: "Match de Compatibilidade Quente 💋 | Zintia Vids",
  };

  const title = titles[activeLang] || titles.es;

  return {
    title,
    description: "Compara tu gusto en videos con el de tu amigo y descubre qué tan compatibles son.",
    robots: "noindex, nofollow",
  };
}

export default async function SharedPlaylistPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeLang = (resolvedParams.lang as Language) || "es";
  const playlistParam = resolvedParams.playlist || "";

  // Parse playlist IDs and load video objects
  const videoIds = playlistParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const videos: Video[] = [];
  for (const id of videoIds) {
    const video = await getVideoById(id);
    if (video) {
      videos.push(video);
    }
  }

  return (
    <div className="w-full flex items-center justify-center py-10 min-h-[80vh] animate-fade-in">
      <SharedPlaylistClient videos={videos} lang={activeLang} />
    </div>
  );
}
