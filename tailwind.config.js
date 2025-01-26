module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,html}',
    './src/app/items/*.{js,ts,jsx,tsx,html}',

  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
}