import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettier, // 👈 禁用 ESLint 中与 Prettier 冲突的格式化规则
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
