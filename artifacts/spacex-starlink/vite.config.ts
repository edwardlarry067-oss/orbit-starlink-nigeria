import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(async () => {
  const plugins = [
    react(),
    tailwindcss(),
  ];

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
    plugins.push(runtimeErrorOverlay());

    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(
      cartographer({
        root: path.resolve(import.meta.dirname, ".."),
      })
    );
  }

  return {
    plugins,
    define: {
      "window.__VITE_API_URL__": JSON.stringify(process.env.VITE_API_URL ?? ""),
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@workspace/api-client-react": path.resolve(import.meta.dirname, "../lib/api-client-react/src/index.ts"),
      },
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/lucide-react") || id.includes("node_modules/react-icons")) {
              return "icons";
            }
            if (id.includes("node_modules/framer-motion")) {
              return "framer-motion";
            }
            if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-") || id.includes("node_modules/victory-")) {
              return "charts";
            }
            if (id.includes("node_modules/@radix-ui")) {
              return "radix-ui";
            }
            if (id.includes("node_modules/@tanstack")) {
              return "tanstack";
            }
            if (
              id.includes("/node_modules/react/") ||
              id.includes("/node_modules/react-dom/") ||
              id.includes("/node_modules/scheduler/")
            ) {
              return "react-vendor";
            }
            if (id.includes("node_modules/")) {
              return "vendor";
            }
          },
        },
      },
    },
    server: {
      port: 5000,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 5000,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
