import { create } from "zustand";

interface UIStore {
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  activeVideoId: string | null;
  setActiveVideoId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMuted: true, // Default to true for browser-compliant silent autoplay
  setMuted: (muted) => set({ isMuted: muted }),
  activeVideoId: null,
  setActiveVideoId: (id) => set({ activeVideoId: id }),
}));
