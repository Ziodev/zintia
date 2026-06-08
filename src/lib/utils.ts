import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/[^\w\-]+/g, "") // remove all non-word chars
    .replace(/\-\-+/g, "-") // replace multiple - with single -
    .replace(/^-+/, "") // trim from start
    .replace(/-+$/, ""); // trim from end
}

export function getMobideaLink(_pubSubId: string): string {
  // Bypassed: point directly to the BeMob click tracker URL to centralize all traffic exits
  let token = "";
  let isBeMobTok = false;
  
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("beMobTok")) {
      token = urlParams.get("beMobTok") || "";
      isBeMobTok = true;
    } else {
      token = urlParams.get("cid") || urlParams.get("click") || urlParams.get("clickId") || "";
    }
  }

  const baseUrl = "https://sqena.bemobtrcks.com/click";
  if (token) {
    return isBeMobTok ? `${baseUrl}?beMobTok=${token}` : `${baseUrl}?cid=${token}`;
  }
  return baseUrl;
}

