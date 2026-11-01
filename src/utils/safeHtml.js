import DOMPurify from "dompurify";

// A student's typed answer is stored as HTML (rich text editor). Before a teacher's browser shows it, keep only
// plain formatting tags and drop every attribute, so nothing in it can run code, load files or link away.
const KEEP = new Set([
  "P", "BR", "B", "STRONG", "I", "EM", "U", "S", "SUB", "SUP", "UL", "OL", "LI",
  "H1", "H2", "H3", "H4", "BLOCKQUOTE", "PRE", "CODE", "SPAN", "DIV", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD",
]);
const DROP_WITH_CONTENT = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "TEMPLATE", "NOSCRIPT", "SVG", "MATH"]);

export function safeHtml(html) {
  if (!html || typeof window === "undefined") return "";
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  const clean = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (DROP_WITH_CONTENT.has(child.tagName)) { child.remove(); continue; }
        clean(child);
        if (!KEEP.has(child.tagName)) { child.replaceWith(...child.childNodes); continue; }
        for (const a of [...child.attributes]) child.removeAttribute(a.name);
      } else if (child.nodeType !== Node.TEXT_NODE) {
        child.remove();
      }
    }
  };
  clean(doc.body);
  return doc.body.innerHTML;
}

// Course outlines and blog posts need links and images, so they use DOMPurify:
// it keeps normal formatting, links and pictures but removes scripts, event
// handlers and javascript: links.
export function safeRichHtml(html) {
  return DOMPurify.sanitize(html || "", { USE_PROFILES: { html: true } });
}
