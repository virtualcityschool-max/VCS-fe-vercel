// Countries for sign-up and profile forms: dial code (no "+") and timezone.
// Gulf and Pakistan first, where most VCS families are.
export const COUNTRIES = [
  { name: "Saudi Arabia", dial: "966", tz: "Asia/Riyadh" },
  { name: "United Arab Emirates", dial: "971", tz: "Asia/Dubai" },
  { name: "Qatar", dial: "974", tz: "Asia/Qatar" },
  { name: "Kuwait", dial: "965", tz: "Asia/Kuwait" },
  { name: "Bahrain", dial: "973", tz: "Asia/Bahrain" },
  { name: "Oman", dial: "968", tz: "Asia/Muscat" },
  { name: "Pakistan", dial: "92", tz: "Asia/Karachi" },
  { name: "United Kingdom", dial: "44", tz: "Europe/London" },
  { name: "United States", dial: "1", tz: "America/New_York" },
  { name: "Canada", dial: "1", tz: "America/Toronto" },
  { name: "India", dial: "91", tz: "Asia/Kolkata" },
  { name: "Bangladesh", dial: "880", tz: "Asia/Dhaka" },
  { name: "Egypt", dial: "20", tz: "Africa/Cairo" },
  { name: "Jordan", dial: "962", tz: "Asia/Amman" },
  { name: "Palestine", dial: "970", tz: "Asia/Hebron" },
  { name: "Malaysia", dial: "60", tz: "Asia/Kuala_Lumpur" },
  { name: "Turkey", dial: "90", tz: "Europe/Istanbul" },
  { name: "Australia", dial: "61", tz: "Australia/Sydney" },
];

export const DIAL_CODES = Array.from(new Map(COUNTRIES.map((c) => [c.dial, c])).values());

// "+966 050-123" + dial "966" → "966501 23…" digits, leading zeros dropped.
export const joinPhone = (dial, number) => {
  const n = String(number || "").replace(/[^\d]/g, "").replace(/^0+/, "");
  return n ? `${dial}${n}` : "";
};
