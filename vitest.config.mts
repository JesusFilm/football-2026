import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "next/navigation": "next/navigation.js",
      "next/server": "next/server.js",
    },
    tsconfigPaths: true,
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
});
