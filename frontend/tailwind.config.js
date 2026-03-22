/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#1b262c",
        surface: "#22343c",
        primary: "#0f4c75",
        primaryHover: "#3282b8",
        textMain: "#e8f1f8",
        textSoft: "#bbe1fa",
        accent: "#d4af37",
      }
    }
  },
  plugins: [],
}