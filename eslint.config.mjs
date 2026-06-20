import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react/display-name": "off",
      "@next/next/no-img-element": "off",
      // El App original define sub-componentes dentro de funciones — deshabilitamos esa regla
      "react-hooks/rules-of-hooks": "warn",
    },
  },
];

export default eslintConfig;
