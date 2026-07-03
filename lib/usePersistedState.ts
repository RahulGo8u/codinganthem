"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useState backed by localStorage. Starts at `defaultValue` on both server and
 * client renders (avoiding hydration mismatches), then hydrates from storage
 * right after mount — same pattern already used for recent-tools tracking.
 */
export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setState(JSON.parse(stored));
    } catch {
      // malformed value or storage unavailable — keep default
    }
  }, [key]);

  const setPersisted = useCallback(
    (value: T) => {
      setState(value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // private browsing / quota exceeded — state still updates in memory
      }
    },
    [key]
  );

  return [state, setPersisted];
}
