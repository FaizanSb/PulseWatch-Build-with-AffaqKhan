/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        bgmain: "var(--bg)",
        card: "var(--card)",
        primary: "var(--primary)"
      }
    }
  },
  plugins: [],
}