import { useEffect } from "react";

// Keeps a side menu in view while the page scrolls. position: sticky does not
// work on this site (html/body have overflow-x: hidden), so the box is fixed
// and placed over its column by hand, stopping at the end of `endRef`.
export function useFollowingBox(slotRef, boxRef, endRef, dep) {
  useEffect(() => {
    const place = () => {
      const slot = slotRef.current, box = boxRef.current, end = endRef.current;
      if (!slot || !box || !end) return;
      if (slot.offsetParent === null) { box.style.position = ""; return; }
      const r = slot.getBoundingClientRect();
      const bottom = end.getBoundingClientRect().bottom;
      const top = Math.min(Math.max(24, r.top), bottom - box.offsetHeight);
      box.style.position = "fixed";
      box.style.left = `${r.left}px`;
      box.style.width = `${r.width}px`;
      box.style.top = `${top}px`;
      box.style.maxHeight = `${window.innerHeight - Math.max(top, 24) - 24}px`;
    };
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("scroll", place); window.removeEventListener("resize", place); };
  }, [slotRef, boxRef, endRef, dep]);
}

// The id of the section currently being read, from the elements matching `selector`.
export function useActiveSection(selector, dep, setActive) {
  useEffect(() => {
    const els = [...document.querySelectorAll(selector)];
    if (!els.length) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [selector, dep, setActive]);
}
