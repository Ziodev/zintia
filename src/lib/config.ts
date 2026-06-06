export const AFFILIATE_LINKS = {
  webcams: process.env.NEXT_PUBLIC_AFFILIATE_WEBCAMS || "https://example.com/webcam-affiliate",
  dating: process.env.NEXT_PUBLIC_AFFILIATE_DATING || "https://example.com/dating-swipe-affiliate",
  private: process.env.NEXT_PUBLIC_AFFILIATE_PRIVATE || "https://example.com/private-video-affiliate",
  default: process.env.NEXT_PUBLIC_AFFILIATE_DEFAULT || "https://example.com/affiliate-link",
};
