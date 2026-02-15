/**
 * Custom hook for animated number counter (count-up effect).
 * Used in the BigNumbers section on the landing page.
 */

import { useEffect, useState } from "react";

interface UseCounterOptions {
  /** Target number to count to */
  end: number;
  /** Starting number. Default: 0 */
  start?: number;
  /** Duration of animation in ms. Default: 2000 */
  duration?: number;
  /** Whether to start the animation. Default: true */
  enabled?: boolean;
}

/**
 * Animate a number from start to end over a duration.
 * @param options - Counter configuration
 * @returns Current animated value
 */
export function useCounter(options: UseCounterOptions): number {
  const { end, start = 0, duration = 2000, enabled = true } = options;
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (!enabled) {
      setValue(start);
      return;
    }

    const startTime = performance.now();
    const range = end - start;

    function animate(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + range * eased);

      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    const frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [end, start, duration, enabled]);

  return value;
}
