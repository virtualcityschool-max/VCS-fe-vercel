// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import axiosInstance from "../utils/axiosInstance";

// A fake server: the first call says "expired", the refresh hands back a new
// access AND a new refresh token (the backend rotates and blocks the old one).
function fakeServer() {
  const calls = [];
  axiosInstance.defaults.adapter = async (config) => {
    calls.push(config.url);
    const reply = (status, data) => {
      const res = { data, status, statusText: "", headers: {}, config };
      if (status >= 400) {
        const err = new Error(`HTTP ${status}`);
        err.config = config;
        err.response = res;
        throw err;
      }
      return res;
    };
    if (config.url.includes("token/refresh")) return reply(200, { access: "new-access", refresh: "new-refresh" });
    if (config.headers.Authorization === "Bearer new-access") return reply(200, { ok: true });
    return reply(401, { detail: "expired" });
  };
  return calls;
}

describe("axios token refresh", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the rotated refresh token", async () => {
    localStorage.setItem("vcs_refresh_token", "old-refresh");
    const calls = fakeServer();
    const res = await axiosInstance.get("/auth/me/");
    expect(res.data.ok).toBe(true);
    expect(calls.some((u) => u.includes("token/refresh"))).toBe(true);
    expect(localStorage.getItem("vcs_refresh_token")).toBe("new-refresh");
  });
});
