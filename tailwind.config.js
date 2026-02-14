
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        slideUp: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        savePulse: 'pulse-green 1.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
