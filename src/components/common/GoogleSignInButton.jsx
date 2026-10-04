import React, { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID } from "../../constants";
import { toastManager } from "../../utils/toastManager";

/**
 * GoogleSignInButton
 * Integrates Google Identity Services (GIS) using official Google rendered button.
 * Injects GIS client dynamically on demand. Zero external npm dependencies.
 */
const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = "continue_with",
  theme = "outline",
  shape = "pill",
  size = "large",
  width = 320,
  className = "",
  disabled = false,
}) => {
  const containerRef = useRef(null);
  const [isScriptReady, setIsScriptReady] = useState(
    () => typeof window !== "undefined" && !!window.google?.accounts?.id
  );
  const [hasRenderError, setHasRenderError] = useState(false);

  useEffect(() => {
    let intervalId = null;
    let attempts = 0;
    const maxAttempts = 30; // 6 seconds total

    // Inject GIS client script dynamically if not already loaded
    if (typeof window !== "undefined" && !window.google?.accounts?.id) {
      if (!document.getElementById("google-gsi-client")) {
        const script = document.createElement("script");
        script.id = "google-gsi-client";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    const checkAndInitGoogle = () => {
      attempts += 1;
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        setIsScriptReady(true);
        if (intervalId) clearInterval(intervalId);
        renderButton();
      } else if (attempts >= maxAttempts) {
        if (intervalId) clearInterval(intervalId);
        setHasRenderError(true);
      }
    };

    const renderButton = () => {
      if (!containerRef.current || !window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response && response.credential) {
              if (onSuccess) onSuccess(response.credential);
            } else {
              if (onError) onError(new Error("No credential received from Google"));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear any previous rendered children
        containerRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(containerRef.current, {
          theme,
          size,
          text,
          shape,
          width: Math.min(width, containerRef.current.parentElement?.clientWidth || width),
          logo_alignment: "left",
        });
      } catch (err) {
        console.error("Error rendering Google button:", err);
        setHasRenderError(true);
      }
    };

    // Check immediately
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      renderButton();
    } else {
      intervalId = setInterval(checkAndInitGoogle, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, theme, shape, size, width, onSuccess, onError]);

  if (hasRenderError) {
    return (
      <div className={`w-full flex flex-col items-center gap-2 ${className}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (window.google?.accounts?.id) {
              window.google.accounts.id.prompt();
            } else {
              toastManager.error(
                "Google Sign-In is blocked by browser shield/extension. Please allow accounts.google.com and refresh."
              );
            }
          }}
          className="w-full max-w-[320px] flex items-center justify-center gap-3 bg-white text-slate-800 hover:bg-slate-100 font-semibold py-3 px-4 rounded-full border border-slate-300 shadow-sm transition active:scale-95 text-sm cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
        <span className="text-[10px] text-slate-500">Google accounts connection required</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[44px] ${className}`}>
      <div ref={containerRef} className="flex justify-center" />
      {!isScriptReady && (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
          <i className="fas fa-spinner fa-spin text-indigo-400" />
          <span>Connecting with Google...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
