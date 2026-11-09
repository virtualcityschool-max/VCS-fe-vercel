import React from "react";
import { loadModule } from "../../routes/lazyPage";

// For extra pieces that load on their own (login popup, portal sidebar,
// profile check). If one fails to download or crashes, it is simply left out
// and the page itself stays on screen. Without this, the app-wide error
// screen replaced the whole page, and Google indexed course pages as
// "Something went wrong" (Search Console, 2026-11-09).
export class OptionalPart extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.warn("Optional part skipped:", error?.message || error); }
  render() {
    if (this.state.failed) return null;
    return <React.Suspense fallback={null}>{this.props.children}</React.Suspense>;
  }
}

// React.lazy that tries a failed download once more before giving up.
export const lazyRetry = (factory) => React.lazy(() => loadModule(factory));
