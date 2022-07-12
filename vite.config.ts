import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import type { UserConfigExport } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const config: UserConfigExport = {
    plugins: [react()],

    // Alias our local ./src directory for app imports
    resolve: {
      alias: {
        src: path.resolve(__dirname, "src"),
      },
    },
  };

  return config;
});
