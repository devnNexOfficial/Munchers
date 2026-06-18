import simpleImportSort from "eslint-plugin-simple-import-sort";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Import groups: React/Next -> third-party -> absolute @/ -> relative
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react", "^next", "^next/(.*)"],
            ["^[^@./]"],
            ["^@/"],
            ["^\\./"]
          ]
        }
      ],
      "simple-import-sort/exports": "error"
    }
  }
];

export default eslintConfig;
