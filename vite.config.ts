import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    server: {
      host: env.VITE_ALLOW_PUBLIC_HOST === "true" ? "0.0.0.0" : "127.0.0.1",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    optimizeDeps: {
      entries: ["index.html", "src/main.tsx"],
      exclude: ["msw", "@mswjs/interceptors", "@open-draft/deferred-promise"],
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
