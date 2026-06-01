// Password validation utilities
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true, error: null };
};

// Phone validation — accepts any international number (7–15 digits, optional + prefix and separators)
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, error: null }; // optional field
  const trimmed = phone.trim();
  // Strip allowed formatting characters, keeping the optional leading +
  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/[\s\-().+]/g, "");
  
  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, error: "Phone number may only contain digits, spaces, dashes, or parentheses" };
  }
  
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return { isValid: false, error: "Phone number must be between 7 and 15 digits" };
  }
  
  // If a + was present the first digit group is the country code (1–3 digits, must not start with 0)
  if (hasPlus && /^0/.test(digitsOnly)) {
    return { isValid: false, error: "Country code cannot start with 0" };
  }
  
  // For standard country code validation, it should start with +
  if (!hasPlus) {
    return { isValid: false, error: "Phone number must include a country code (start with +)" };
  }

  return { isValid: true, error: null };
};

/**
 * Normalizes a phone number to E.164-like format: +[digits]
 * @param {string} phone 
 * @returns {string}
 */
export const normalizePhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return `+${digits}`;
};

/**
 * Formats a phone number for display (e.g., +92 300 1234567)
 * @param {string} phone 
 * @returns {string}
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return "";
  const normalized = normalizePhone(phone);
  
  // Basic formatting: +XX XXXXXXXX
  // For better formatting, we could match against common dial codes
  const dialCodes = ["+92", "+44", "+61", "+1", "+971"];
  for (const code of dialCodes) {
    if (normalized.startsWith(code)) {
      const rest = normalized.slice(code.length);
      if (code === "+92" && rest.length === 10) {
        return `${code} ${rest.slice(0, 3)} ${rest.slice(3)}`;
      }
      return `${code} ${rest}`;
    }
  }
  
  return normalized;
};

// Username validation
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, error: "Username is required" };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      error: "Username must be at least 3 characters long",
    };
  }

  if (username.length > 150) {
    return { isValid: false, error: "Username must be 150 characters or less" };
  }

  // Allow letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error:
        "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }

  return { isValid: true, error: null };
};

// Role validation
export const validateRole = (role) => {
  const validRoles = ["student", "teacher", "parent", "admin"];

  if (!role) {
    return { isValid: false, error: "Please select a role" };
  }

  if (!validRoles.includes(role)) {
    return { isValid: false, error: "Please select a valid role" };
  }

  return { isValid: true, error: null };
};

// Form validation helper
export const validateRegistrationForm = (formData) => {
  const { email, username, password, confirmPassword, role } = formData;
  const errors = {};

  // Email validation
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  // Username validation
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.error;
  }

  // Password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0]; // Show first error
  }

  // Confirm password validation
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Role validation
  const roleValidation = validateRole(role);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const clampDate = (value) => {
  if (!value) return value;
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  let [year, month, day] = parts;
  year = year.slice(0, 4);
  const y = Math.max(1, Math.min(9999, parseInt(year, 10) || 1));
  year = String(y).padStart(4, "0");
  const m = Math.max(1, Math.min(12, parseInt(month, 10) || 1));
  month = String(m).padStart(2, "0");
  const d = Math.max(1, Math.min(31, parseInt(day, 10) || 1));
  day = String(d).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Returns "+05:00" / "-04:00" style offset for the given timezone at the given moment.
// Classic trick: parse the same instant formatted in UTC vs the target tz — local offset cancels.
const getOffsetStr = (timeZone, forDate = new Date()) => {
  const utcDate = new Date(forDate.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate  = new Date(forDate.toLocaleString("en-US", { timeZone }));
  const diff    = Math.round((tzDate - utcDate) / 60000);
  const sign    = diff >= 0 ? "+" : "-";
  const abs     = Math.abs(diff);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
};

// Converts ISO string to "YYYY-MM-DDTHH:mm" for a datetime-local input.
// Pass timeZone (e.g. "Asia/Karachi") to display in that timezone; omit for browser local.
export const toLocalDatetimeInput = (isoString, timeZone) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (timeZone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(d);
    const get  = (type) => parts.find((p) => p.type === type)?.value ?? "00";
    const hour = get("hour") === "24" ? "00" : get("hour");
    return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
  }
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Converts a datetime-local input value ("YYYY-MM-DDTHH:mm") to an ISO string
// with the correct offset for the given timezone (or browser local if omitted).
export const formatTimezoneISO = (localString, timeZone) => {
  if (!localString) return "";
  if (!timeZone) return formatLocalISO(new Date(localString));
  const offsetStr = getOffsetStr(timeZone, new Date(localString));
  const [datePart, timePart] = localString.split("T");
  return `${datePart}T${timePart.slice(0, 5)}:00${offsetStr}`;
};

// "May 15, 2026"  — pass timeZone (e.g. "Asia/Karachi") to override browser locale
export const formatDate = (isoString, timeZone) => {
  if (!isoString) return "—";
  try {
    const opts = { year: "numeric", month: "short", day: "numeric" };
    if (timeZone) opts.timeZone = timeZone;
    return new Date(isoString).toLocaleDateString(undefined, opts);
  } catch {
    return "—";
  }
};

// Lookup table: IANA → { std, dst? }. Used when Intl returns a generic "GMT+X" offset.
const TZ_ABBR_MAP = {
  "Asia/Dubai":           { std: "GST" },
  "Asia/Karachi":         { std: "PKT" },
  "Asia/Kolkata":         { std: "IST" },
  "Asia/Colombo":         { std: "IST" },
  "Asia/Dhaka":           { std: "BST" },
  "Asia/Kathmandu":       { std: "NPT" },
  "Asia/Rangoon":         { std: "MMT" },
  "Asia/Yangon":          { std: "MMT" },
  "Asia/Bangkok":         { std: "ICT" },
  "Asia/Ho_Chi_Minh":     { std: "ICT" },
  "Asia/Jakarta":         { std: "WIB" },
  "Asia/Shanghai":        { std: "CST" },
  "Asia/Hong_Kong":       { std: "HKT" },
  "Asia/Singapore":       { std: "SGT" },
  "Asia/Kuala_Lumpur":    { std: "MYT" },
  "Asia/Manila":          { std: "PHT" },
  "Asia/Tokyo":           { std: "JST" },
  "Asia/Seoul":           { std: "KST" },
  "Asia/Almaty":          { std: "ALMT" },
  "Asia/Tashkent":        { std: "UZT" },
  "Asia/Baku":            { std: "AZT" },
  "Asia/Yerevan":         { std: "AMT" },
  "Asia/Tbilisi":         { std: "GET" },
  "Asia/Riyadh":          { std: "AST" },
  "Asia/Kuwait":          { std: "AST" },
  "Asia/Qatar":           { std: "AST" },
  "Asia/Baghdad":         { std: "AST" },
  "Asia/Tehran":          { std: "IRST" },
  "Europe/Moscow":        { std: "MSK" },
  "Europe/Minsk":         { std: "FET" },
  "Europe/Istanbul":      { std: "TRT" },
  "Europe/Kaliningrad":   { std: "EET" },
  "Africa/Cairo":         { std: "EET" },
  "Africa/Johannesburg":  { std: "SAST" },
  "Africa/Nairobi":       { std: "EAT" },
  "Africa/Lagos":         { std: "WAT" },
  "Africa/Casablanca":    { std: "WET" },
  "America/Caracas":      { std: "VET" },
  "America/Bogota":       { std: "COT" },
  "America/Lima":         { std: "PET" },
  "America/Phoenix":      { std: "MST" },
  "America/Argentina/Buenos_Aires": { std: "ART" },
  "Pacific/Honolulu":     { std: "HST" },
  "Pacific/Guam":         { std: "ChST" },
  // DST zones
  "Europe/London":        { std: "GMT",  dst: "BST"  },
  "Europe/Dublin":        { std: "GMT",  dst: "IST"  },
  "Europe/Paris":         { std: "CET",  dst: "CEST" },
  "Europe/Berlin":        { std: "CET",  dst: "CEST" },
  "Europe/Copenhagen":    { std: "CET",  dst: "CEST" },
  "Europe/Stockholm":     { std: "CET",  dst: "CEST" },
  "Europe/Amsterdam":     { std: "CET",  dst: "CEST" },
  "Europe/Brussels":      { std: "CET",  dst: "CEST" },
  "Europe/Rome":          { std: "CET",  dst: "CEST" },
  "Europe/Madrid":        { std: "CET",  dst: "CEST" },
  "Europe/Zurich":        { std: "CET",  dst: "CEST" },
  "Europe/Vienna":        { std: "CET",  dst: "CEST" },
  "Europe/Warsaw":        { std: "CET",  dst: "CEST" },
  "Europe/Prague":        { std: "CET",  dst: "CEST" },
  "Europe/Budapest":      { std: "CET",  dst: "CEST" },
  "Europe/Bucharest":     { std: "EET",  dst: "EEST" },
  "Europe/Helsinki":      { std: "EET",  dst: "EEST" },
  "Europe/Athens":        { std: "EET",  dst: "EEST" },
  "Europe/Kiev":          { std: "EET",  dst: "EEST" },
  "Europe/Riga":          { std: "EET",  dst: "EEST" },
  "Europe/Vilnius":       { std: "EET",  dst: "EEST" },
  "Europe/Tallinn":       { std: "EET",  dst: "EEST" },
  "America/New_York":     { std: "EST",  dst: "EDT"  },
  "America/Toronto":      { std: "EST",  dst: "EDT"  },
  "America/Detroit":      { std: "EST",  dst: "EDT"  },
  "America/Chicago":      { std: "CST",  dst: "CDT"  },
  "America/Denver":       { std: "MST",  dst: "MDT"  },
  "America/Los_Angeles":  { std: "PST",  dst: "PDT"  },
  "America/Vancouver":    { std: "PST",  dst: "PDT"  },
  "America/Anchorage":    { std: "AKST", dst: "AKDT" },
  "America/Halifax":      { std: "AST",  dst: "ADT"  },
  "America/St_Johns":     { std: "NST",  dst: "NDT"  },
  "America/Sao_Paulo":    { std: "BRT",  dst: "BRST" },
  "America/Santiago":     { std: "CLT",  dst: "CLST" },
  "Australia/Sydney":     { std: "AEST", dst: "AEDT" },
  "Australia/Melbourne":  { std: "AEST", dst: "AEDT" },
  "Australia/Brisbane":   { std: "AEST" },
  "Australia/Adelaide":   { std: "ACST", dst: "ACDT" },
  "Australia/Perth":      { std: "AWST" },
  "Pacific/Auckland":     { std: "NZST", dst: "NZDT" },
  "Antarctica/McMurdo":   { std: "NZST", dst: "NZDT" },
  "Pacific/Fiji":         { std: "FJT",  dst: "FJST" },
};

const _tzOffset = (tz, date) => {
  try {
    const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const loc = new Date(date.toLocaleString("en-US", { timeZone: tz }));
    return Math.round((loc - utc) / 60000);
  } catch { return 0; }
};

const _isDST = (tz) => {
  try {
    const y = new Date().getFullYear();
    const jan = _tzOffset(tz, new Date(y, 0, 15));
    const jul = _tzOffset(tz, new Date(y, 6, 15));
    if (jan === jul) return false;
    return _tzOffset(tz, new Date()) === Math.max(jan, jul);
  } catch { return false; }
};

// Returns the correct summer or winter abbreviation (PKT, GST, BST, EDT, …)
export const getTimezoneAbbr = (timeZone) => {
  try {
    const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Try Intl first — modern browsers return proper abbreviations
    const intlAbbr = new Intl.DateTimeFormat("en", { timeZoneName: "short", timeZone: tz })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value || "";

    // If Intl returned a real abbreviation (not a generic "GMT+X" offset), use it
    if (intlAbbr && !/^(GMT|UTC)[+-]/.test(intlAbbr)) return intlAbbr;

    // Fall back to lookup table for environments that return "GMT+5" etc.
    const entry = TZ_ABBR_MAP[tz];
    if (!entry) return intlAbbr;
    if (!entry.dst) return entry.std;
    return _isDST(tz) ? entry.dst : entry.std;
  } catch {
    return "";
  }
};

// "12:28 PM"
export const formatTime = (isoString, timeZone) => {
  if (!isoString) return "";
  try {
    const opts = { hour: "2-digit", minute: "2-digit" };
    if (timeZone) opts.timeZone = timeZone;
    return new Date(isoString).toLocaleTimeString([], opts);
  } catch {
    return "";
  }
};

// "May 15, 2026, 12:28 PM"
export const formatDateTime = (isoString, timeZone) => {
  if (!isoString) return "—";
  try {
    const opts = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    if (timeZone) opts.timeZone = timeZone;
    return new Date(isoString).toLocaleString(undefined, opts);
  } catch {
    return "—";
  }
};

export const formatLocalISO = (date) => {
    const offset = -date.getTimezoneOffset();
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
    const mins = (absOffset % 60).toString().padStart(2, '0');
    const sign = offset >= 0 ? '+' : '-';
    
    // Manually build the string so it doesn't convert to UTC
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hh}:${mm}:${ss}${sign}${hours}:${mins}`;
}
