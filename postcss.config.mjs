// Next.js 15 expects the new PostCSS config shape; using object form avoids
// the "Malformed PostCSS Configuration" error seen with an array of functions.
// See: https://nextjs.org/docs/messages/postcss-shape
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
