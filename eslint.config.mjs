import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  prettier,
  globalIgnores([
    ".next/**",
    ".devcontainer/**",
    ".pnpm-store/**",
    "coverage/**",
    "node_modules/**",
    "out/**",
    "football-2026-unpacked/**",
  ]),
]);
