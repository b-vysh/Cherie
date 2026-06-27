/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#FFFAEB',
        'brand-primary': '#115E63',
        'brand-accent': '#FFA3A3',
        'brand-peach': '#FFE0D6',
        'brand-green': '#D2EDA1',
      },
      fontFamily: {
        heading: ['"Lobster Two"', 'cursive'],
        body: ['Inder', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
