"use client";

import { useEffect, useState } from "react";

// Un único interval compartido para todos los consumidores de useNow().
let current = Date.now();
const subscribers = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  current = Date.now();
  subscribers.forEach((fn) => fn());
}

/** Reloj reactivo: re-renderiza cada `intervalMs` (default 30s) con un solo timer global. */
export function useNow(intervalMs = 30_000): number {
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((n) => n + 1);
    subscribers.add(fn);
    if (!timer) timer = setInterval(tick, intervalMs);
    return () => {
      subscribers.delete(fn);
      if (subscribers.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, [intervalMs]);

  return current;
}
