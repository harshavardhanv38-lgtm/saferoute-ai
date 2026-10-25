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
          50:  '#e8edf5',
          100: '#c5d0e6',
          200: '#9eb0d5',
          300: '#7690c4',
          400: '#5878b8',
          500: '#3a60ab',
          600: '#2d4e8a',
          700: '#1e3668',
          800: '#0f2147',
          900: '#060f28',
          950: '#030810',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(6,15,40,0.18)',
        glow: '0 0 20px rgba(20,184,166,0.25)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #060f28 0%, #0f2147 50%, #0d9488 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(15,33,71,0.95) 0%, rgba(6,15,40,0.98) 100%)',
      }
    },
  },
  plugins: [],
}
