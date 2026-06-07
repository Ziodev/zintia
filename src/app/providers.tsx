"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { usePopunder } from "@/hooks/usePopunder";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  usePopunder();

  useEffect(() => {
    // Capture Clickadu tracking parameters if present in the URL
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const click = params.get("click");
        const zona = params.get("zona");
        if (click) {
          sessionStorage.setItem("clickadu_click", click);
          localStorage.setItem("clickadu_click", click);
        }
        if (zona) {
          sessionStorage.setItem("clickadu_zona", zona);
          localStorage.setItem("clickadu_zona", zona);
        }
      } catch (e) {
        console.error("Failed to parse tracking query params:", e);
      }
    }

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: true, // Auto-capture page views for routing transitions
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

