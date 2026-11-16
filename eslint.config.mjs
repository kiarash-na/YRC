import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Use the project cn (src/lib/utils.ts) — it knows the YRC type scale.
    // The bare package merges text-h1 etc. as colors and drops sizes.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/utils.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "cn",
              message: 'Import { cn } from "@/lib/utils" instead.',
            },
          ],
        },
      ],
    },
  },
  {
    // Edge functions render React Email, not Next pages: a <link> to a
    // webfont in an email <Head> is correct there.
    files: ["supabase/functions/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-page-custom-font": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test output
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
