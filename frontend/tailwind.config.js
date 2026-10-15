/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F8F7F4',
        ink: '#111111',
        muted: '#666666',
        accent: '#6D28D9',
        accentSoft: '#EDE9FE',
        line: '#E5E5E5',
        charcoal: '#181818',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        editorial: ['"Libre Caslon Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
