/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sand: {
          50: "#f8f5f0",
          100: "#eee3d1",
          200: "#e1caa2",
          300: "#d0a76f",
          400: "#c28a47",
          500: "#a96f2d",
          600: "#865422",
          700: "#654019",
          800: "#462b11",
          900: "#291909",
        },
        midnight: {
          900: "#0b1725",
          800: "#12233a",
          700: "#1d3550",
          600: "#2d4a6e",
          500: "#3f618d",
          400: "#5479aa",
          300: "#7395c1",
          200: "#99b5d7",
          100: "#c7d9ec",
          50: "#edf3fa",
        },
      },
      boxShadow: {
        glow: "0 20px 45px -20px rgba(17, 29, 53, 0.35)",
      },
    },
  },
  plugins: [],
};
