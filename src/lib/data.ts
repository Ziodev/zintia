export interface Video {
  id: string;
  title: string;
  duration: string;
  views: string;
  category: string;
  thumbnailUrl: string;
  videoPreviewUrl: string;
}

export interface Ad {
  title: string;
  ctaText: string;
  affiliateUrl: string;
  thumbnailUrl: string;
  videoPreviewUrl: string;
  variant?: "standard" | "private" | "interactive";
}

export const MOCK_VIDEOS: Video[] = [
  {
    id: "v1",
    title: "Aficionada amateur sorprende a su pareja en San Valentín",
    duration: "14:23",
    views: "1.2M",
    category: "amateur",
    thumbnailUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: "v2",
    title: "La mejor escena anal de la temporada - Estreno Exclusivo",
    duration: "25:40",
    views: "850K",
    category: "anal",
    thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: "v3",
    title: "Madura sexy enseña sus secretos de seducción",
    duration: "18:15",
    views: "3.4M",
    category: "milf",
    thumbnailUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    id: "v4",
    title: "Grabación casera real en la playa - Sin Censura",
    duration: "08:12",
    views: "2.1M",
    category: "caseros",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: "v5",
    title: "Hermosa latina baila en vivo ante la cámara",
    duration: "12:05",
    views: "980K",
    category: "latinas",
    thumbnailUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  },
  {
    id: "v6",
    title: "Sesión amateur grabada en primera persona (POV)",
    duration: "19:42",
    views: "640K",
    category: "amateur",
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  },
  {
    id: "v7",
    title: "Modelo de webcam interactiva cumple fantasías en directo",
    duration: "15:00",
    views: "1.5M",
    category: "webcams",
    thumbnailUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  },
  {
    id: "v8",
    title: "Madura espectacular te invita a su apartamento privado",
    duration: "30:10",
    views: "2.8M",
    category: "milf",
    thumbnailUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  },
];

export const MOCK_ADS: Ad[] = [
  {
    title: "CHAT DE WEBCAMS GRATIS - Miles de Modelos online en Vivo ahora",
    ctaText: "VER MODELOS",
    affiliateUrl: "https://example.com/webcam-affiliate",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    variant: "standard",
  },
  {
    title: "VIDEO PRIVADO FILTRADO - Toca para desbloquear gratis",
    ctaText: "DESBLOQUEAR",
    affiliateUrl: "https://example.com/private-video-affiliate",
    thumbnailUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    variant: "private",
  },
  {
    title: "Sofía te ha enviado una invitación para chat privado",
    ctaText: "CHATEAR",
    affiliateUrl: "https://example.com/dating-swipe-affiliate",
    thumbnailUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
    videoPreviewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    variant: "interactive",
  },
];
