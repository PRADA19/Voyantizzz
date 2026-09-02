/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#f0f7fb',
          900: '#ffffff',
          800: '#f1f6fa',
          700: '#e2eff7',
          600: '#cbd5e1',
          500: '#0284c7',
          100: '#0f2942',
        },
        maritime: {
          cyan: '#0891b2',
          blue: '#0284c7',
          teal: '#0d9488',
          gold: '#d97706',
        }
      }
    },
  },
  plugins: [],
}
