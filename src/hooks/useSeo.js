import { useEffect } from "react";

/**
 * useSeo — lightweight, dependency-free document head manager.
 *
 * Sets the page <title> plus common SEO / social meta tags (description,
 * canonical, Open Graph, Twitter) while a component is mounted, and restores
 * the previous values on unmount. Suitable for a client-rendered SPA — good
 * enough for search engines that execute JS and for social link previews,
 * without pulling in a head-management dependency.
 *
 * Usage:
 *   useSeo({
 *     title: "My Post — VCS Blog",
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

export const useSeo = ({
  title,
  description,
  image,
  url,
  type = "website",
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

    // Restore prior head state when the page unmounts / deps change.
    return () => {
      document.title = prevTitle;
      handles.forEach((h) => {
        if (!h) return;
        if (h.created) {
          h.el.remove();
        } else if (h.prev != null) {
          h.el.setAttribute(h.el.tagName === "LINK" ? "href" : "content", h.prev);
        }
      });
    };
  }, [title, description, image, url, type]);
};

export default useSeo;
