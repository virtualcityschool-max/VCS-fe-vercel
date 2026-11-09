import React from "react";

// React.lazy with a preload(): once preloaded, the page renders straight away
// (no Suspense fallback), so a prerendered page doesn't flash a spinner while
// the app takes over. `name` picks a named export instead of the default.
// Download a code file, try once more if it fails or comes back empty, and
// reject (never resolve with nothing) if the second try fails too.
export const loadModule = (factory, name = "default") => {
  const once = () => factory().then((m) => {
    if (!m || m[name] === undefined) throw new Error("A code file came back empty (download failed)");
    return m;
  });
  return once().catch(() => new Promise((r) => setTimeout(r, 800)).then(once));
};

export const lazyPage = (factory, name = "default") => {
  let Loaded = null;
  // A failed download is tried once more before giving up (slow connections,
  // and Google's page renderer, sometimes drop a request).
  const fetchOnce = () => loadModule(factory, name);
  const load = () => fetchOnce().then((m) => { Loaded = m[name]; return { default: m[name] }; });
  const Lazy = React.lazy(load);
  const Page = (props) => (Loaded ? <Loaded {...props} /> : <Lazy {...props} />);
  Page.preload = () => (Loaded ? Promise.resolve() : load().then(() => undefined));
  return Page;
};
