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

const render = () => createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);

// Load the current public page's code first, so the prerendered page is
// replaced by the same page, never by a loading spinner. Render regardless.
preloadPublicPage(window.location.pathname).catch(() => {}).finally(render);
