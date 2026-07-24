// Returns "First Last" when both names are present, else falls back to
// username - needed for accounts created before first/last name existed.
export const getDisplayName = (user) => {
  if (!user) return "";
  const first = user.first_name || user.firstName;
  const last = user.last_name || user.lastName;
  if (first && last) return `${first} ${last}`;
  return user.display_name || user.username || "";
};
