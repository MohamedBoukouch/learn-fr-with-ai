/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#007bff',
          dark: '#0056b3',
        },
        secondary: {
          light: '#ff85a1',
          DEFAULT: '#ff4d6d',
          dark: '#c9184a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
