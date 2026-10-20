// Turns decorative Unicode letters (𝕌𝕣𝕕𝕦, 𝐁𝐨𝐥𝐝, ｆｕｌｌ-ｗｉｄｔｈ) into normal
// letters, so search engines and screen readers read real words.
export const plainText = (s) => (s == null ? "" : String(s).normalize("NFKC"));

const fixCase = (w) =>
  w.length > 1 && (w === w.toLowerCase() || w === w.toUpperCase())
    ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    : w;

// Tidies a person's name for display: "Aliza_Ikhlaq" → "Aliza Ikhlaq",
// "aamir waqas" → "Aamir Waqas", "Hina HINA" → "Hina", "Dr.Samreen_" →
// "Dr. Samreen". Mixed-case words ("AunAli", "McKenzie") are left alone.
export const personName = (s) => {
  const words = plainText(s)
    .replace(/_/g, " ")
    .replace(/\.(?=\p{L})/gu, ". ")
    .split(/\s+/)
    .filter(Boolean)
    .map(fixCase);
  return words
    .filter((w, i) => i === 0 || w.toLowerCase() !== words[i - 1].toLowerCase())
    .join(" ");
};

// Returns "First Last" when both names are present, else falls back to
// username - needed for accounts created before first/last name existed.
export const getDisplayName = (user) => {
  if (!user) return "";
  const first = user.first_name || user.firstName;
  const last = user.last_name || user.lastName;
  if (first && last) return personName(`${first} ${last}`);
  return personName(user.display_name || user.username || "");
};
