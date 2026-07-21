"use client";

import { useEffect, useState } from "react";

const REPO = "RahulGo8u/codinganthem";
const CACHE_KEY = "ca_gh_stars";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function GitHubStars({ className = "" }: { className?: string }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { count, ts } = JSON.parse(cached) as { count: number; ts: number };
        if (Date.now() - ts < CACHE_TTL_MS) {
          setStars(count);
          return;
        }
      }
    } catch {
      // ignore malformed cache
    }

    fetch(`https://api.github.com/repos/${REPO}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.stargazers_count !== "number") return;
        setStars(data.stargazers_count);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ count: data.stargazers_count, ts: Date.now() })
          );
        } catch {
          // ignore quota errors
        }
      })
      .catch(() => {
        // silently ignore — badge just won't render
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Reserve a stable slot sized for the full loaded badge (12px icon + gap +
  // up to ~4 chars like "1.2k"), so revealing it never pushes surrounding
  // footer links around (avoids layout shift / CLS).
  return (
    <span
      className={`inline-flex items-center justify-start gap-1 text-[var(--text-muted)] tabular-nums ${className || "w-[3.75rem]"}`}
      aria-hidden={stars === null}
    >
      {stars !== null && (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#f59e0b] shrink-0">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {formatCount(stars)}
        </>
      )}
    </span>
  );
}
