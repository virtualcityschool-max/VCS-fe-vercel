// The Mock Exams subject menu for the "Mock Exams" dropdown in the site menu: which subjects and papers are live,
// read from the Mock Exams app (GET /mocks/api/catalog, public, cached there for 5 minutes). Loaded on the first
// hover or focus, then kept for the visit. A failed load leaves the dropdown with just its "All subjects" link.
import { useCallback, useState } from "react";

const ORIGIN = (import.meta.env.VITE_MOCKS_ORIGIN || "").replace(/\/+$/, "");
let cache = null;
let pending = null;

export function useMocksCatalog() {
  const [data, setData] = useState(cache);
  const load = useCallback(() => {
    if (cache) return;
    pending ??= fetch(`${ORIGIN}/mocks/api/catalog`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.groups)) cache = d;
        return cache;
      })
      .catch(() => null)
      .finally(() => {
        pending = null;
      });
    pending.then((d) => d && setData(d));
  }, []);
  return { data, load };
}
