/**
 * Custom hook to detect when an element enters the viewport.
 * Uses Intersection Observer API for scroll-reveal animations.
 */

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Threshold ratio (0-1) for triggering. Default: 0.1 */
  threshold?: number;
  /** Root margin (CSS-like). Default: "0px" */
  rootMargin?: string;
  /** Whether to trigger only once. Default: true */
  triggerOnce?: boolean;
}

interface UseInViewResult {
  /** Ref to attach to the observed element */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Whether the element is currently in view */
  inView: boolean;
}

/**
 * Observe an element's visibility in the viewport.
 * @param options - Configuration for the Intersection Observer
 * @returns Ref to attach and inView boolean
 */
export function useInView(options: UseInViewOptions = {}): UseInViewResult {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, inView };
}
