export interface Video {
  id: string;
  title: string;
  duration: string;
  views: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  videoPreviewUrl: string;
  embedUrl?: string;
}

export interface Ad {
  title: string;
  ctaText: string;
  affiliateUrl: string;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  variant?: "standard" | "private" | "interactive";
}

export const MOCK_ADS: Ad[] = [
  {
    title: "💋 Chat en Vivo",
    ctaText: "Entrar Gratis →",
    affiliateUrl: "https://example.com/affiliate/livechat",
    thumbnailUrl: "",
    videoPreviewUrl: "",
    variant: "interactive",
  },
  {
    title: "🔥 Citas Calientes",
    ctaText: "Regístrate →",
    affiliateUrl: "https://example.com/affiliate/dating",
    thumbnailUrl: "",
    videoPreviewUrl: "",
    variant: "standard",
  },
  {
    title: "🎥 Webcams Privadas",
    ctaText: "Ver Ahora →",
    affiliateUrl: "https://example.com/affiliate/cams",
    thumbnailUrl: "",
    videoPreviewUrl: "",
    variant: "private",
  },
];
