import { useEffect } from "react";

/**
 * Global "click the dim backdrop to close" behaviour for every modal.
 *
 * Nearly all popups in the app are a full-screen `fixed inset-0` dim backdrop
 * wrapping a panel (which stops click propagation) and containing a close
 * control — an X icon button or an element labelled "Close". Rather than wiring
 * outside-click into each of the ~40 modals, this installs ONE document
 * listener: when a click lands directly on such a backdrop (not on the panel
 * inside it), it finds that modal's close control and triggers it.
 *
 * A modal can opt out by putting `data-no-outside-close` on its backdrop, or
 * expose an explicit close target with `data-modal-close`.
 */
export const useOutsideCloseModals = () => {
  useEffect(() => {
    const isDimFullscreenBackdrop = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.hasAttribute("data-no-outside-close")) return false;
      const style = window.getComputedStyle(el);
      if (style.position !== "fixed") return false;
      if (style.pointerEvents === "none") return false;
      // Must cover essentially the whole viewport.
      const r = el.getBoundingClientRect();
      if (r.width < window.innerWidth * 0.9 || r.height < window.innerHeight * 0.9) {
        return false;
      }
      // Must look like a modal backdrop: a non-transparent background OR a
      // backdrop-blur layer (covers both `bg-black/60` and blur-only overlays).
      const bg = style.backgroundColor || "";
      const hasDim = bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)";
      const filter = style.backdropFilter || style.webkitBackdropFilter || "";
      const hasBlur = filter && filter !== "none";
      return hasDim || hasBlur;
    };

    const findCloseControl = (backdrop) => {
      const explicit =
        backdrop.querySelector("[data-modal-close]") ||
        backdrop.querySelector('[aria-label="Close"], [aria-label="close"]');
      if (explicit) return explicit;

      const icon = backdrop.querySelector(
        "button i.fa-times, button i.fa-xmark, button .fa-times, button .fa-xmark",
      );
      if (icon) return icon.closest("button");

      // Last resort: a button whose visible text is Close / Cancel.
      for (const btn of backdrop.querySelectorAll("button")) {
        if (btn.disabled) continue;
        const text = (btn.textContent || "").trim().toLowerCase();
        if (text === "close" || text === "cancel") return btn;
      }
      return null;
    };

    const onMouseDown = (e) => {
      // Only when the backdrop ITSELF is the direct target — a click on any modal
      // content sets target to a child element, which we ignore.
      if (!isDimFullscreenBackdrop(e.target)) return;
      const closeEl = findCloseControl(e.target);
      if (closeEl) {
        e.preventDefault();
        closeEl.click();
      }
    };

    document.addEventListener("mousedown", onMouseDown, true);
    return () => document.removeEventListener("mousedown", onMouseDown, true);
  }, []);
};

export default useOutsideCloseModals;
