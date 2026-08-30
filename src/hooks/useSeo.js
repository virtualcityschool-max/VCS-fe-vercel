import { useEffect } from "react";

/**
 * useSeo - lightweight, dependency-free document head manager.
 *
 * Sets the page <title> plus common SEO / social meta tags (description,
 * canonical, Open Graph, Twitter) while a component is mounted, and restores
 * the previous values on unmount. Suitable for a client-rendered SPA - good
 * enough for search engines that execute JS and for social link previews,
 * without pulling in a head-management dependency.
 *
 * Usage:
 *   useSeo({
 *     title: "My Post - VCS Blog",
 *     description: "...",
 *     image: "https://.../cover.jpg",
 *     url: window.location.href,
 *     type: "article",
 *   });
 */
const SITE_NAME = "Virtual City School";
const DEFAULT_TITLE = "VirtualCitySchool | Advanced Learning Ecosystem";

const setMeta = (attr, key, content) => {
  if (typeof document === "undefined") return null;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  const created = !el;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const prev = el.getAttribute("content");
  el.setAttribute("content", content ?? "");
  return { el, created, prev };
};

const setLink = (rel, href) => {
  if (typeof document === "undefined") return null;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  const created = !el;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  const prev = el.getAttribute("href");
  el.setAttribute("href", href ?? "");
  return { el, created, prev };
};

// Accepts either a single schema.org object (used as-is, unchanged behavior)
// or an array of objects (e.g. [FAQPage, BreadcrumbList]), which are combined
// into one document via @graph so a route can carry more than one schema
// type without stacking multiple <script> tags.
const setJsonLd = (data) => {
    if (typeof document === "undefined") return null;
    let el = document.head.querySelector('script[data-seo-jsonld="true"]');
    const created = !el;
    if (!el) {
          el = document.createElement("script");
          el.type = "application/ld+json";
          el.setAttribute("data-seo-jsonld", "true");
          document.head.appendChild(el);
    }
    const prev = el.textContent;
    const payload = Array.isArray(data)
      ? { "@context": "https://schema.org", "@graph": data }
      : data;
    el.textContent = JSON.stringify(payload);
    return { el, created, prev };
};

// Manages a set of <link rel="alternate" hreflang="..."> tags for
// language/region variants (e.g. en-sa, en-ae, x-default). These are
// additive elements with no single prior value to restore, so unlike
// setMeta/setLink this just creates its own tags on mount and removes
// exactly those tags on cleanup.
const setHreflangAlternates = (alternates) => {
  if (typeof document === "undefined" || !alternates?.length) return null;
  const els = alternates.map(({ hreflang, href }) => {
    const el = document.createElement("link");
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", hreflang);
    el.setAttribute("href", href);
    el.setAttribute("data-seo-hreflang", "true");
    document.head.appendChild(el);
    return el;
  });
  return { els };
};

export const useSeo = ({
  title,
  description,
  image,
  url,
  type = "website",
    jsonLd,
    hreflangAlternates,
} = {}) => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const prevTitle = document.title;
    const fullTitle = title
      ? title.includes(SITE_NAME) || title.includes("VirtualCitySchool")
        ? title
        : `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE;
    document.title = fullTitle;

    const handles = [];
    const track = (h) => h && handles.push(h);

    if (description) {
      track(setMeta("name", "description", description));
      track(setMeta("property", "og:description", description));
      track(setMeta("name", "twitter:description", description));
    }
    track(setMeta("property", "og:title", fullTitle));
    track(setMeta("name", "twitter:title", fullTitle));
    track(setMeta("property", "og:type", type));
    track(setMeta("property", "og:site_name", SITE_NAME));
    track(setMeta("name", "twitter:card", image ? "summary_large_image" : "summary"));
    if (image) {
      track(setMeta("property", "og:image", image));
      track(setMeta("name", "twitter:image", image));
    }
    if (url) {
      track(setMeta("property", "og:url", url));
      track(setLink("canonical", url));
    }
  if (jsonLd) {
        track(setJsonLd(jsonLd));
  }

  const hreflangHandle = setHreflangAlternates(hreflangAlternates);

    // Restore prior head state when the page unmounts / deps change.
    return () => {
      document.title = prevTitle;
      handles.forEach((h) => {
        if (!h) return;
        if (h.created) {
          h.el.remove();
        } else if (h.prev != null) {
          if (h.el.tagName === "SCRIPT") {
                        h.el.textContent = h.prev;
          } else {
                        h.el.setAttribute(h.el.tagName === "LINK" ? "href" : "content", h.prev);
          }
        }
      });
      hreflangHandle?.els.forEach((el) => el.remove());
    };
  }, [title, description, image, url, type, jsonLd, hreflangAlternates]);
};

export default useSeo;
