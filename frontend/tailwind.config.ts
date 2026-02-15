import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F97316",
        "primary-hover": "#EA580C",
        dark: "#1C1917",
        "dark-hover": "#292524",
        bg: "#FAFAF8",
        "bg-gray": "#F5F5F5",
        "text-muted": "#78716C",
        "text-light": "#A8A29E",
        border: "#E7E5E4",
        "border-light": "#F3F2F0",
        success: "#16A34A",
        blue: "#3B82F6",
        purple: "#8B5CF6",
        pink: "#EC4899",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        button: "10px",
        card: "16px",
        "card-lg": "20px",
      },
    },
  },
  plugins: [],
} satisfies Config;
