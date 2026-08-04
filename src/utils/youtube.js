/**
 * YouTube link helpers for video blogs.
 *
 * The backend already parses the video id and returns ready-made embed /
 * thumbnail URLs, but the admin editor needs the same logic client-side so the
 * preview can appear the instant a URL is pasted — before anything is saved.
 * Keep this in step with `blogs/utils.py`.
 */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

// youtu.be/<id>, /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
const PATH_RE =
  /^https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/;

// youtube.com/watch?v=<id> — v may sit anywhere in the query string
const WATCH_RE =
  /^https?:\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/;

/** Returns the 11-char video id, or "" when the URL isn't a YouTube link. */
export const parseYouTubeId = (url) => {
  if (!url) return "";
  const value = String(url).trim();
  if (ID_RE.test(value)) return value;
  return (WATCH_RE.exec(value) || PATH_RE.exec(value) || [])[1] || "";
};

/** Privacy-friendly player URL. Pass { autoplay: true } after a user gesture. */
export const youTubeEmbedUrl = (videoId, { autoplay = false } = {}) => {
  if (!videoId) return "";
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
};

export const youTubeWatchUrl = (videoId) =>
  videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";

/**
 * Poster image. `hqdefault` is generated for every upload — `maxresdefault`
 * 404s on lower-resolution videos, which would leave a broken image.
 */
export const youTubeThumbnail = (videoId) =>
  videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";

/** True when the post should render a player instead of a cover image. */
export const isVideoBlog = (blog) =>
  blog?.post_type === "video" && Boolean(blog?.video_id || blog?.video_url);

/**
 * The id to play for a blog, whether it came from the API (video_id) or is
 * still being typed in the editor (video_url).
 */
export const blogVideoId = (blog) =>
  blog?.video_id || parseYouTubeId(blog?.video_url);
