import React from "react";

// React.lazy with a preload(): once preloaded, the page renders straight away
// (no Suspense fallback), so a prerendered page doesn't flash a spinner while
// the app takes over. `name` picks a named export instead of the default.
export const lazyPage = (factory, name = "default") => {
  let Loaded = null;
  const load = () => factory().then((m) => { Loaded = m[name]; return { default: m[name] }; });
  const Lazy = React.lazy(load);
  const Page = (props) => (Loaded ? <Loaded {...props} /> : <Lazy {...props} />);
  Page.preload = () => (Loaded ? Promise.resolve() : load().then(() => undefined));
  return Page;
};
