/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0f1419",
          800: "#1a2332",
          700: "#252f3f",
        },
        gold: {
          500: "#d4af37",
          600: "#b8941f",
        },
      },
    },
  },
  plugins: [],
};
