import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import type { UserConfigExport } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config: UserConfigExport = {
    plugins: [react()],
  };

  // Alias our local ./src directory for app imports
  config.resolve = {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  };

  // HMR doesn't work with preact/compat in `development`
  if (mode === "production") {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    };
  }

  return config;
});
