// VCS Mock Exams (www.virtualcityschool.com/mocks — a separate app behind this site's /mocks rewrite).
// Calls its API with this site's own access token: the Mocks app checks it with our /auth/me/ endpoint.
// Same origin in production; in local development VITE_MOCKS_ORIGIN points at the Mocks dev server.
import axiosInstance from "../utils/axiosInstance";
import { authStorage } from "../utils/authStorage";

const MOCKS_ORIGIN = (import.meta.env.VITE_MOCKS_ORIGIN || "").replace(/\/+$/, "");
export const MOCKS_URL = `${MOCKS_ORIGIN}/mocks`;
const API = `${MOCKS_URL}/api`;

/** An expired access token is refreshed by our own API client (its 401 handler), then the call is tried once more. */
async function refreshToken() {
  try {
    await axiosInstance.get("/auth/me/");
  } catch {
    /* the API client logs the user out if the refresh token is gone */
  }
}

async function call(path, { method = "GET", body, retry = true, credentials = "omit" } = {}) {
  const token = authStorage.getAccessToken();
  const res = await fetch(`${API}${path}`, {
    method,
    credentials,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && retry) {
    await refreshToken();
    return call(path, { method, body, retry: false, credentials });
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = new Error(data?.error || "Mock Exams is not responding. Please try again.");
    err.status = res.status;
    throw err;
  }
  return data;
}

// Tells the teacher menu badge (hooks/useMocksInbox.js) to recount after a script or review changes.
const changed = (data) => {
  try {
    window.dispatchEvent(new Event("vcs:mocks-changed"));
  } catch {
    /* no window (tests) */
  }
  return data;
};

export const mocksService = {
  /** Teacher: scripts Mock Admin assigned to me. */
  listScripts: () => call("/marking/scripts"),
  /** Teacher: one script with question pages, the student's answers and photos, and the mark scheme. */
  getScript: (id) => call(`/marking/scripts/${encodeURIComponent(id)}`),
  /** Teacher: save marks and comments (a draft until returned). */
  saveMarks: (id, payload) => call(`/marking/scripts/${encodeURIComponent(id)}`, { method: "PUT", body: payload }).then(changed),
  /** Teacher: send the marked script to the student. */
  returnScript: (id) => call(`/marking/scripts/${encodeURIComponent(id)}/return`, { method: "POST" }).then(changed),

  /** Teacher: past papers Mock Admin asked me to review. */
  listReviews: () => call("/marking/reviews"),
  /** Teacher: one paper to review (questions, marks, mark scheme, my notes; the HOD also sees every review). */
  getReview: (id) => call(`/marking/reviews/${encodeURIComponent(id)}`),
  /** Teacher: save my review notes; { submit: true } sends them to Mock Admin. */
  saveReview: (id, payload) => call(`/marking/reviews/${encodeURIComponent(id)}`, { method: "PUT", body: payload }).then(changed),

  /** Open Mock Exams signed in with this VCS account (sets the Mocks session cookie).
   *  to = "admin": a VCS admin opens Mocks Admin (Super Admin -> full admin, Finance -> payment approvals). */
  async openSession(to) {
    const token = authStorage.getAccessToken();
    const data = await call("/vcs/session", { method: "POST", body: to ? { token, to } : { token }, credentials: "include" });
    return `${MOCKS_ORIGIN}${data?.redirect || "/mocks/dashboard"}`;
  },
};

export default mocksService;
