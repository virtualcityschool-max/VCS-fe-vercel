// How many Mock Exams items are waiting for this teacher: scripts to mark (or fix and resend) plus past papers
// to review. Shown as a red number on "Mock Exams" in the teacher menu, like unread mail.
// Refreshes on every page change, every 2 minutes, when the tab comes back into view, and when the marking
// pages announce a change (window event "vcs:mocks-changed"). A failed call keeps the last number.
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { mocksService } from "../services/mocksService";

const EVERY_MS = 2 * 60 * 1000;
const MIN_GAP_MS = 20 * 1000;
export const MOCKS_CHANGED = "vcs:mocks-changed";

const waiting = (scripts, reviews) =>
  (scripts ?? []).filter((s) => s.status === "assigned" || s.status === "marked").length +
  (reviews ?? []).filter((r) => r.status !== "done").length;

export function useMocksInbox(enabled) {
  const [count, setCount] = useState(0);
  const lastAt = useRef(0);
  const { pathname } = useLocation();

  const refresh = useCallback(
    async (force = false) => {
      if (!enabled) return;
      if (!force && Date.now() - lastAt.current < MIN_GAP_MS) return;
      lastAt.current = Date.now();
      const [s, r] = await Promise.allSettled([mocksService.listScripts(), mocksService.listReviews()]);
      if (s.status !== "fulfilled" && r.status !== "fulfilled") return;
      setCount(waiting(s.value?.scripts, r.value?.reviews));
    },
    [enabled],
  );

  // Recount on each page change (after render, so the effect itself sets no state).
  useEffect(() => {
    void Promise.resolve().then(() => refresh());
  }, [refresh, pathname]);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = setInterval(() => refresh(true), EVERY_MS);
    const onChange = () => refresh(true);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    window.addEventListener(MOCKS_CHANGED, onChange);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener(MOCKS_CHANGED, onChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, refresh]);

  return enabled ? count : 0;
}
