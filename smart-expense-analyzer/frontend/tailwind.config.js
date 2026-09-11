/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0F1626",
          soft: "#1A2338",
          softer: "#232E48",
        },
        canvas: "#F4F6FA",
        brand: {
          50: "#EAF6F0",
          100: "#CDEADB",
          400: "#2C9370",
          500: "#1F7A5C",
          600: "#166248",
          700: "#124F3B",
        },
        gold: {
          400: "#E3B23C",
          500: "#C9962A",
        },
        danger: {
          400: "#E2685D",
          500: "#D6483F",
          50: "#FBEAE8",
        },
        warn: {
          400: "#EFB65D",
          500: "#E1A33E",
          50: "#FBF1DF",
        },
        ok: {
          400: "#37B07C",
          500: "#1F9D63",
          50: "#E6F7EE",
        },
        ink900: "#101828",
        ink600: "#475467",
        ink400: "#98A2B3",
        line: "#E4E7EC",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};
