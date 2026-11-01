// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { safeHtml, safeRichHtml } from "../utils/safeHtml";

describe("safeHtml (student answers)", () => {
  it("removes scripts and event handlers", () => {
    const out = safeHtml('<p>Hi<img src=x onerror="alert(1)"><script>steal()</script></p>');
    expect(out).not.toMatch(/onerror|<script|<img/);
    expect(out).toContain("Hi");
  });
  it("keeps plain formatting", () => {
    expect(safeHtml("<p><strong>Bold</strong> and <em>italic</em></p>")).toBe("<p><strong>Bold</strong> and <em>italic</em></p>");
  });
});

describe("safeRichHtml (outlines, blogs)", () => {
  it("keeps links and images but drops javascript: and handlers", () => {
    const out = safeRichHtml('<a href="https://x.com">ok</a><a href="javascript:alert(1)">bad</a><img src="/a.png" onload="x()">');
    expect(out).toContain('href="https://x.com"');
    expect(out).not.toMatch(/javascript:|onload/);
    expect(out).toContain('src="/a.png"');
  });
  it("keeps Quill list markers", () => {
    expect(safeRichHtml('<ol><li data-list="bullet">a</li></ol>')).toContain('data-list="bullet"');
  });
});
