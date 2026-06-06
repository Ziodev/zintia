import { Video } from "./data";
import { DRTUBER_FALLBACK_VIDEOS } from "./drtuber_fallback";
import { extractTags, parseChannelTags, mergeTags } from "./auto-tagger";

const DRTUBER_FEED_URL = "http://webmaster.drtuber.com/?show=export&action=generate&aid=6694&channel=!&one=on&protocol=http&hq=0&pr=0&cnt=500&tmb=4&tcnt=1&owner=&ord=0&rating=0&delimeter=%7C&el=0&efr=0&ep=0&fr=0&f=&field1=1&field2=2&field3=3&field4=4&field5=5&field7=7&field8=0&field10=10&field11=11&field12=12&field13=13";

function mapCategories(channelsString: string): string {
  const tags = channelsString.toLowerCase().split(",").map(t => t.trim());
  
  if (tags.some(t => t.includes("anal"))) return "anal";
  if (tags.some(t => t.includes("milf") || t.includes("mature") || t.includes("step mom") || t.includes("stepmom") || t.includes("bbw"))) return "milf";
  if (tags.some(t => t.includes("latin") || t.includes("latina") || t.includes("spanish") || t.includes("brazil") || t.includes("colombian"))) return "latinas";
  if (tags.some(t => t.includes("webcam") || t.includes("cam") || t.includes("live"))) return "webcams";
  if (tags.some(t => t.includes("homemade") || t.includes("outdoor") || t.includes("casero") || t.includes("pov"))) return "caseros";
  if (tags.some(t => t.includes("ebony") || t.includes("black"))) return "ebony";
  if (tags.some(t => t.includes("amateur") || t.includes("teen") || t.includes("uniform") || t.includes("solo"))) return "amateur";
  
  return "amateur"; // default fallback
}

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let m = shuffled.length, t, i;
  let currentSeed = seed;

  const random = () => {
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  while (m) {
    i = Math.floor(random() * m--);
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }
  return shuffled;
}

export async function getVideos(): Promise<Video[]> {
  let drtuberVideos: Video[] = [];

  try {
    // Fetch with cache revalidation of 1 hour
    const response = await fetch(DRTUBER_FEED_URL, { 
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      throw new Error(`Feed fetch failed: status ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split("\n");

    for (const line of lines) {
      if (!line.trim() || line.startsWith("#") || line.startsWith("Title:") || line.startsWith("Description:") || line.startsWith("Source:") || line.startsWith("---")) {
        continue;
      }

      const parts = line.split("|");
      if (parts.length < 10) continue;

      const vid = parts[0];
      const url = parts[1];
      const thumbs = parts[2];
      const title = parts[3];
      const channels = parts[4];
      const length = parts[5];
      const date = parts[6];
      const pornstars = parts[7];
      const mainThumb = parts[8];
      const videoTrailer = parts[9];

      // Ensure HTTPS
      const httpsThumb = mainThumb ? mainThumb.replace("http://", "https://") : "";
      const httpsTrailer = videoTrailer ? videoTrailer.replace("http://", "https://") : "";

      // Deterministic pseudo-random views
      let hash = 0;
      for (let i = 0; i < vid.length; i++) {
        hash = vid.charCodeAt(i) + ((hash << 5) - hash);
      }
      const viewCount = Math.abs(hash % 900) + 100;
      const views = `${viewCount}K`;

      // Extract and merge tags from both channels and title
      const rawTags = parseChannelTags(channels);
      const extractedTags = extractTags(title, channels);
      const allTags = mergeTags(rawTags, extractedTags);

      drtuberVideos.push({
        id: vid,
        title: title,
        duration: length || "10:00",
        views: views,
        category: mapCategories(channels),
        tags: allTags,
        thumbnailUrl: httpsThumb,
        videoPreviewUrl: httpsTrailer,
        embedUrl: `https://www.drtuber.com/embed/${vid}`,
      });
    }

    if (drtuberVideos.length === 0) {
      throw new Error("No videos parsed from feed");
    }
  } catch (err) {
    console.warn("Could not fetch live DrTuber feed, loading static fallback:", err);
    drtuberVideos = DRTUBER_FALLBACK_VIDEOS;
  }

  // Shuffle the final list using a 15-minute time seed to make the homepage rotate dynamically
  const timeSeed = Math.floor(Date.now() / (15 * 60 * 1000));
  return shuffleWithSeed(drtuberVideos, timeSeed);
}
