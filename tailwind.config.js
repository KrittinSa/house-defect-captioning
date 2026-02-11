/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'sans-serif'],
      },
      colors: {
        crimson: {
          DEFAULT: '#FF0000',
          dark: '#B30000',
          light: '#FF4D4D',
        },
        gunmetal: {
          DEFAULT: '#2D2D2D',
          dark: '#1A1A1A',
          light: '#404040',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 15px rgba(255, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
