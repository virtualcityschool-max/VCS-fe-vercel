// Offline timetable for the installed app (and the browser).
// After the class list loads, the signed-in user's upcoming classes are saved
// on this device (IndexedDB, one record per user), WITHOUT Meet links, so
// /offline.html can show "your next classes" when there is no internet.
// Cleared on logout. public/offline.html reads the same database by hand,
// so keep DB / STORE / record shape in step with it.

const DB = "vcs-app";
const STORE = "timetable";
const KEEP_DAYS = 14;
const MAX_ROWS = 60;

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no indexedDB"));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "userId" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function currentUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("vcs_auth_user") || "null");
    // Admins see every class in the school; that list stays off the device.
    if (!u || u.role === "admin") return null;
    return u.id ?? u.user?.id ?? u.email ?? null;
  } catch {
    return null;
  }
}

function toRows(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  const now = Date.now();
  const until = now + KEEP_DAYS * 86400000;
  return list
    .map((s) => {
      const at = s.next_occurrence || s.scheduled_at;
      const t = at ? Date.parse(at) : NaN;
      const mins = Number(s.duration_mins) || 60;
      return {
        title: String(s.title || s.course_title || "Class").slice(0, 120),
        course: String(s.course_title || "").slice(0, 120),
        teacher: String(s.teacher_name || "").slice(0, 80),
        start: at,
        t,
        end: Number.isFinite(t) ? new Date(t + mins * 60000).toISOString() : null,
        status: s.status || "",
      };
    })
    .filter((r) => Number.isFinite(r.t) && r.t + 3 * 3600000 > now && r.t < until && r.status !== "cancelled")
    .sort((a, b) => a.t - b.t)
    .slice(0, MAX_ROWS)
    .map(({ t: _t, ...r }) => r);
}

export async function saveTimetable(data) {
  try {
    const userId = currentUserId();
    if (userId == null) return;
    const rows = toRows(data);
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      // One user per device at a time: replace whatever was there.
      const store = tx.objectStore(STORE);
      store.clear();
      store.put({ userId: String(userId), savedAt: new Date().toISOString(), rows });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Saving the offline copy must never disturb the page.
  }
}

export async function clearTimetable() {
  try {
    const db = await openDb();
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
    db.close();
  } catch {
    /* nothing saved */
  }
}
