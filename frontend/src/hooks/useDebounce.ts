/**
 * Custom hook for debouncing a value.
 * Used for INN lookup to avoid excessive API calls while typing.
 */

import { useEffect, useState } from "react";

/**
 * Debounce a value by a specified delay.
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds. Default: 500
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
