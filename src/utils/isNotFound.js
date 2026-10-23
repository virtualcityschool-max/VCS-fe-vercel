// True when a failed API request means "this record doesn't exist" (HTTP 404),
// as opposed to a temporary failure. Public pages tell Google not to list a
// page only in the first case: a brief outage must never drop a real page.
export const isNotFound = (err) => err?.response?.status === 404 || err?.status === 404;
