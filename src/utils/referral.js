// Referral-code capture helpers.
//
// When a visitor opens a referral link (…/signup?ref=CODE or /?ref=CODE) the
// code is stashed in sessionStorage so it survives the multi-step register →
// OTP → success flow (and page reloads) within that browser tab. It is sent
// along with the signup request and cleared once registration is verified.
// sessionStorage (not localStorage) is deliberate: referral intent should not
// outlive the tab.

const REF_KEY = "vcs_ref_code";

// Normalize to the same shape the backend stores/compares (uppercase, trimmed).
const normalize = (code) =>
  (code || "").toString().trim().toUpperCase().slice(0, 16);

export const getStoredReferralCode = () => {
  try {
    return sessionStorage.getItem(REF_KEY) || "";
  } catch {
    return "";
  }
};

export const setStoredReferralCode = (code) => {
  const clean = normalize(code);
  if (!clean) return;
  try {
    sessionStorage.setItem(REF_KEY, clean);
  } catch {
    /* storage unavailable (private mode) — ignore, signup still works */
  }
};

export const clearStoredReferralCode = () => {
  try {
    sessionStorage.removeItem(REF_KEY);
  } catch {
    /* ignore */
  }
};

// Read a ?ref= value from a URLSearchParams-like object and persist it.
// Returns the stored code (existing or newly captured).
export const captureReferralCode = (searchParams) => {
  const fromUrl = normalize(searchParams?.get?.("ref"));
  if (fromUrl) setStoredReferralCode(fromUrl);
  return getStoredReferralCode();
};
