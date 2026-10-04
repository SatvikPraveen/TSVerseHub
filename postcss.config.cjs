// postcss.config.cjs
// Vite runs PostCSS for every imported stylesheet. Minification is handled by
// Vite's own CSS pipeline, so only Tailwind and vendor prefixing are needed.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
