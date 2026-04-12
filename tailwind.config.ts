import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        card: "#0F1B33",
        border: "rgba(255,255,255,0.08)",
        text: "rgba(255,255,255,0.92)",
        muted: "rgba(255,255,255,0.62)",
        brand: "#5B8CFF",
        good: "#35D07F",
        bad: "#FF5B6E"
      }
    }
  },
  plugins: []
} satisfies Config;

