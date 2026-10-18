// Load one subject guide's content on demand (each guide is its own small
// download), for pages that show a single guide such as the course page.
const loaders = import.meta.glob(["./*-*.js", "!./index.js", "!./catalog.js", "!./load.js"]);

export const loadGuide = (slug) => {
  const load = slug && loaders[`./${slug}.js`];
  return load ? load().then((m) => m.default) : Promise.resolve(null);
};
