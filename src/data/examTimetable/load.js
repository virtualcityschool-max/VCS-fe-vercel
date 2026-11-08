// Load one zone's timetable on demand (each zone is its own small download).
// A failed download is tried once more, as for the subject guides.
const loaders = import.meta.glob("./june-2027-zone-*.js");
const loaded = new Map();

export const loadedTimetable = (zone) => loaded.get(zone);

export const loadTimetable = (zone) => {
  if (loaded.has(zone)) return Promise.resolve(loaded.get(zone));
  const load = loaders[`./june-2027-${zone}.js`];
  if (!load) return Promise.resolve(null);
  return load()
    .catch(() => new Promise((r) => setTimeout(r, 800)).then(load))
    .then((m) => {
      loaded.set(zone, m.default);
      return m.default;
    });
};
