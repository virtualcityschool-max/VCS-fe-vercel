// Load one subject guide's content on demand: each guide is its own small
// download, so a page that shows one guide never fetches the other 17.
// A failed download is tried once more (slow or flaky connections, and
// Google's page renderer, sometimes drop a request).
const loaders = import.meta.glob(["./*-*.js", "!./index.js", "!./catalog.js", "!./cards.js", "!./load.js"]);

const loaded = new Map();

// The guide if it has already been loaded (sync), else undefined.
export const loadedGuide = (slug) => loaded.get(slug);

export const loadGuide = (slug) => {
  if (loaded.has(slug)) return Promise.resolve(loaded.get(slug));
  const load = slug && loaders[`./${slug}.js`];
  if (!load) return Promise.resolve(null);
  return load()
    .catch(() => new Promise((r) => setTimeout(r, 800)).then(load))
    .then((m) => {
      loaded.set(slug, m.default);
      return m.default;
    });
};
