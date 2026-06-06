import { useEffect, useState, RefObject } from "react";

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  {
    threshold = 0,
    rootMargin = "0px",
    root = null,
    freezeOnceVisible = false,
  }: UseIntersectionObserverProps = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);

  useEffect(() => {
    const node = elementRef?.current;
    if (!node || freezeOnceVisible && isIntersecting) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin, root: root ?? undefined }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, rootMargin, root, freezeOnceVisible, isIntersecting]);

  return isIntersecting;
}
