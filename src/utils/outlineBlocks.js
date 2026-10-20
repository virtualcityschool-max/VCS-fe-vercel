// The admin's course outline (rich text from the editor) shown as plain
// headings, paragraphs and bullet points. Only the text is used, never the
// stored HTML, so nothing in it can run on the page, and the heavy editor
// library isn't loaded just to display it.
export const outlineBlocks = (html) => {
  if (!html || typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  const out = [];
  doc.body.querySelectorAll("h1, h2, h3, h4, p, li").forEach((el) => {
    if (el.tagName !== "LI" && el.closest("li")) return;
    const text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    const indent = Number((String(el.className).match(/ql-indent-(\d)/) || [])[1] || 0);
    const strong = el.querySelector("strong, b");
    const allBold = Boolean(strong) && strong.textContent.replace(/\s+/g, " ").trim() === text;
    const kind = /^H\d$/.test(el.tagName) ? "heading" : el.tagName === "LI" ? "item" : allBold ? "heading" : "para";
    // "Label: rest" with a bold label keeps the label bold.
    const lead = !allBold && strong && text.startsWith(strong.textContent.trim()) ? strong.textContent.trim() : null;
    out.push({ kind, text, indent, lead });
  });
  return out;
};
