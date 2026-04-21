const eslintFiles = "*.{js,jsx,ts,tsx,mjs,cjs}";
const prettierFiles = "*.{js,jsx,ts,tsx,mjs,cjs,json,md,mdx,yml,yaml,css,scss}";

const config = {
  [eslintFiles]: "eslint --fix",
  [prettierFiles]: "prettier --write",
};

export default config;
