// Google Analytics 4 conversion events (founder 2026-11-13).
// GA4 is loaded in index.html (G-NLMSH3HS5W). Events go only to GA4 (not to the Ads tag),
// never carry personal data (no names, emails or phone numbers), and never throw.
const GA_ID = "G-NLMSH3HS5W";

export function track(event, params = {}) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", event, { ...params, send_to: GA_ID });
    }
  } catch {
    /* analytics must never break the site */
  }
}
