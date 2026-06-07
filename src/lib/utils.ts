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

export function getMobideaLink(pubSubId: string): string {
  const base = "aHR0cHM6Ly93d3cudW5kZXJsaW5nbWlzdGVyeS5zdXBwb3J0Lz9zbD02MTExMjk3LWY2NWI3";
  let click = "organic";
  let zona = "organic";
  if (typeof window !== "undefined") {
    click = sessionStorage.getItem("clickadu_click") || localStorage.getItem("clickadu_click") || "organic";
    zona = sessionStorage.getItem("clickadu_zona") || localStorage.getItem("clickadu_zona") || "organic";
  }
  return `${atob(base)}&pub_click_id=${click}&site=${zona}&pub_sub_id=${pubSubId}`;
}

