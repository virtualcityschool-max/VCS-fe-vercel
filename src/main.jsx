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
// replaced by the same page, never by a loading spinner. Render regardless.
preloadPublicPage(window.location.pathname).catch(() => {}).finally(render);
