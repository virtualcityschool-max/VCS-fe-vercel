import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store";
import ErrorBoundary from "./components/ErrorBoundary";
import { installChunkReloadHandlers } from "./utils/chunkReload";
import { preloadPublicPage } from "./routes/publicPages";

installChunkReloadHandlers();

const app = (
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);

// The pre-built page (scripts/prerender.js) is replaced by the app here. On
// the list pages the HTML also carries the data it was drawn with (see
// store/index.js), so the app's first drawing is the same page: nothing jumps.
// (Adopting the HTML with hydrateRoot is not possible: the pre-built HTML is a
// browser snapshot without React's Suspense markers.)
const render = () => createRoot(document.getElementById("root")).render(app);

// Load the current public page's code first, so the prerendered page is
// replaced by the same page, never by a loading spinner. If that code can't
// be downloaded (even after a retry), keep the prerendered page as it is
// rather than replacing it with an error screen; a page that wasn't
// prerendered is rendered anyway (the error screen offers a refresh).
const prerendered = () => document.getElementById("root")?.childElementCount > 0;
preloadPublicPage(window.location.pathname).then(render, (error) => {
  if (prerendered()) console.warn("Page code could not be loaded; showing the pre-built page.", error);
  else render();
});
