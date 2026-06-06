import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Worktree agente (git-ignored): contiene checkout + build .next di altre
    // sessioni, non è codice sorgente lintabile.
    ".claude/**",
    // Documentazione evolutive: include bundle di handoff Claude Design
    // (prototipi .jsx di reference, non codice di produzione).
    "evolutive/**",
  ]),
]);

export default eslintConfig;
