"use client";

import { useSyncExternalStore } from "react";

let currentTime: number | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function refresh() {
  currentTime = Date.now();
  listeners.forEach((listener) => listener());
}

function tick() {
  refresh();
  // Align the status and clock with the next HH:MM boundary.
  timer = setTimeout(tick, 60_000 - Date.now() % 60_000);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    tick();
    document.addEventListener("visibilitychange", refresh);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      currentTime = null;
    }
  };
}

const getSnapshot = () => currentTime;

/** One local clock for all status/filter/clock consumers; no network requests. */
export function useEvaluationTime(initialIso?: string) {
  const initial = initialIso ? Date.parse(initialIso) : NaN;
  const instant = useSyncExternalStore(subscribe, getSnapshot, () => Number.isFinite(initial) ? initial : null);
  return instant;
}
