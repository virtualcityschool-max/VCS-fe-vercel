import { useCallback, useEffect, useRef } from "react";

// setTimeout that is cancelled when the game closes.
export function useTimers() {
  const ids = useRef(new Set());
  useEffect(() => {
    const set = ids.current;
    return () => set.forEach(clearTimeout);
  }, []);
  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      ids.current.delete(id);
      fn();
    }, ms);
    ids.current.add(id);
  }, []);
  const clearAll = useCallback(() => {
    ids.current.forEach(clearTimeout);
    ids.current.clear();
  }, []);
  return { later, clearAll };
}

export const rand = (n) => Math.floor(Math.random() * n);
export const shuffle = (xs) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Wall-clock time in ms (for event handlers and timers, not render).
export const nowMs = () => Date.now();
