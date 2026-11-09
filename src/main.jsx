import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
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

// A pre-built page (scripts/prerender.js marks it data-prebuilt and writes
// React's markers into it) is adopted, not redrawn: the text already on
// screen stays, so Chrome doesn't count it as new (Google's LCP). Where the
// app's first drawing differs from the saved HTML (data that loads later,
// a signed-in menu), React redraws just that part, inside the nearest
// Suspense boundary; nothing breaks. On the list pages the HTML also carries
// the data it was drawn with (see store/index.js).
const container = document.getElementById("root");
// The error screen shows this instead when only a code download failed.
if (container?.hasAttribute("data-prebuilt")) window.__VCS_PREBUILT_HTML__ = container.innerHTML;
const render = () => {
  if (container.hasAttribute("data-prebuilt")) {
    hydrateRoot(container, app, {
      // Expected now and then (see above): note it quietly, don't alarm.
      onRecoverableError: (error, info) => {
        if (window.__VCS_HYDRATION_LOG__) window.__VCS_HYDRATION_LOG__.push({ message: String(error?.message || error).slice(0, 300), stack: String(info?.componentStack || "").slice(0, 600) });
        else console.warn("[vcs] part of the pre-built page was redrawn:", error?.message || error);
      },
    });
  } else {
    createRoot(container).render(app);
  }
};

// Load the current public page's code first, so the prerendered page is
// replaced by the same page, never by a loading spinner. If that code can't
// be downloaded (even after a retry), keep the prerendered page as it is
// rather than replacing it with an error screen; a page that wasn't
// prerendered is rendered anyway (the error screen offers a refresh).
const prerendered = () => container?.childElementCount > 0;
preloadPublicPage(window.location.pathname).then(render, (error) => {
  if (prerendered()) console.warn("Page code could not be loaded; showing the pre-built page.", error);
  else render();
});
