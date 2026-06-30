import nextPlugin from "@next/eslint-plugin-next";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    ...nextPlugin.flatConfig.coreWebVitals,
  },
];

export default eslintConfig;
