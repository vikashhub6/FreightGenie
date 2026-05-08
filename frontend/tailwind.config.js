/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        primary: { DEFAULT: "#0ea5e9", dark: "#0284c7", light: "rgba(14,165,233,0.1)" },
        success: "#34d399",
        warning: "#fbbf24",
        danger:  "#fb7185",
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        shimmer: { "0%": { left: "-100%" }, "100%": { left: "200%" } },
      },
    },
  },
  plugins: [],
};
