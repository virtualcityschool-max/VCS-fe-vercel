// Opens a Google Meet (or other class) link from any Join button.
// In a new tab where possible. If the phone blocks it (iPhone/iPad and the
// installed app block windows opened after a server check), go to the link
// directly: the phone then hands it to the Google Meet app, or opens it in
// the browser, and the student comes back to VCS afterwards.
export function openMeet(link) {
  if (!link) return false;
  let win = null;
  try {
    win = window.open(link, "_blank");
  } catch {
    win = null;
  }
  if (win) {
    try { win.opener = null; } catch { /* cross-origin already */ }
    return true;
  }
  window.location.assign(link);
  return true;
}
