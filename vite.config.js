import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_BASE_URL || "https://virtualschool.grayphite.com";

  return {
    plugins: [react(), tailwindcss()],
    // Leftover console.log debugging is removed from the live build (it can
    // print personal data and slows pages). console.warn/error stay.
    esbuild: mode === "production" ? { pure: ["console.log", "console.debug"] } : undefined,
    server: {
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
