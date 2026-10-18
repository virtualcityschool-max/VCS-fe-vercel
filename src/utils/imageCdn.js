// Smaller pictures for small spaces (home page speed). Uploaded images on S3
// are full size (course artwork is 2400 px, some avatars are 1.6 MB PNGs);
// on the live site we ask Vercel's image service for a resized WebP copy.
// Widths must be listed in vercel.json "images.sizes". Locally (and anywhere
// the service isn't available) the original URL is used.

const SIZES = [128, 256, 384, 640, 960, 1280];
const S3 = /^https:\/\/virtual-city-school\.s3\.us-east-2\.amazonaws\.com\//;

const onVercel = () =>
  typeof window !== "undefined" &&
  /(^|\.)virtualcityschool\.com$|\.vercel\.app$/.test(window.location.hostname);

export const sizedImage = (url, width) => {
  if (!url || !S3.test(url) || !onVercel()) return url;
  const w = SIZES.find((s) => s >= width) || SIZES[SIZES.length - 1];
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${w}&q=72`;
};

// onError handler: if the resized copy fails, fall back to the original once.
export const fallbackToOriginal = (original) => (e) => {
  const img = e.currentTarget;
  if (original && img.dataset.fallback !== "1" && img.src !== original) {
    img.dataset.fallback = "1";
    img.src = original;
  }
};
