// Class reminders (web push) for this device.
// Works on Android, computers, and iPhone/iPad (iOS 16.4+) only when VCS is
// installed to the Home Screen. Permission is asked only after a tap.
import axiosInstance from "../utils/axiosInstance";
import { isInstalledApp } from "./registerSW";

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function keyToBytes(base64url) {
  const pad = "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function deviceLabel() {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) || isIOS() ? "iPad" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Computer";
  return `${os}${isInstalledApp() ? " app" : " browser"}`;
}

// The public key (or "not set up") is remembered for an hour on this device,
// so dashboards don't ask the server on every visit.
const KEY_CACHE = "vcs_push_key";
async function serverKey() {
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY_CACHE) || "null");
    if (c && Date.now() - c.at < 3600e3) return c.key;
  } catch { /* no cache */ }
  const { data } = await axiosInstance.get("/classroom/push/key/").catch(() => ({ data: {} }));
  const key = data?.key || "";
  try { sessionStorage.setItem(KEY_CACHE, JSON.stringify({ key, at: Date.now() })); } catch { /* private mode */ }
  return key;
}

async function registration() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.getRegistration("/");
}

/**
 * "unsupported"  – this browser can't do it
 * "install-first" – iPhone/iPad in a browser tab: install the app first
 * "blocked"      – the user said no in the browser settings
 * "off" | "on"   – ready
 * "unavailable"  – server has no keys yet
 */
export async function getReminderState() {
  // Nothing to offer until the school has switched reminders on (server keys).
  if (!(await serverKey())) return "unavailable";
  if (isIOS() && !isInstalledApp()) return "install-first";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  const reg = await registration();
  const sub = reg && (await reg.pushManager.getSubscription());
  return sub ? "on" : "off";
}

export async function enableReminders() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "blocked" : "off";
  const key = await serverKey();
  if (!key) return "unavailable";
  const reg = (await registration()) || (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(key) });
  const json = sub.toJSON();
  await axiosInstance.post("/classroom/push/subscribe/", { endpoint: json.endpoint, keys: json.keys, device_label: deviceLabel() });
  return "on";
}

export async function disableReminders() {
  const reg = await registration();
  const sub = reg && (await reg.pushManager.getSubscription());
  if (sub) {
    await axiosInstance.post("/classroom/push/unsubscribe/", { endpoint: sub.endpoint }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
  return "off";
}

/** On sign-out: stop this device's reminders (the server row goes with the token). */
export async function unsubscribeThisDevice() {
  try {
    const reg = await registration();
    const sub = reg && (await reg.pushManager.getSubscription());
    if (!sub) return;
    // The access token may already be gone; the browser side is what matters:
    // the server deletes the row on the next send (410 from the push service).
    await sub.unsubscribe();
  } catch {
    /* nothing to do */
  }
}
