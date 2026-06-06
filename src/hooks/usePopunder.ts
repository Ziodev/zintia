import { useEffect } from "react";

export function usePopunder(url: string = "https://example.com/affiliate-link") {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkPopunderCap = (): boolean => {
      const lastPop = localStorage.getItem("zintia_last_popunder");
      if (!lastPop) return true;
      const parsed = parseInt(lastPop, 10);
      if (isNaN(parsed)) return true;
      const now = Date.now();
      return now - parsed > 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    };

    const handleFirstClick = () => {
      if (checkPopunderCap()) {
        localStorage.setItem("zintia_last_popunder", Date.now().toString());

        const popWindow = window.open(url, "_blank");
        if (popWindow) {
          window.focus();
        }
      }
      document.removeEventListener("click", handleFirstClick);
    };

    if (checkPopunderCap()) {
      document.addEventListener("click", handleFirstClick);
    }

    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, [url]);
}
