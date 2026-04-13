import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:     "var(--wl-bg)",
        card:   "var(--wl-card)",
        border: "var(--wl-border)",
        text:   "var(--wl-text)",
        muted:  "var(--wl-muted)",
        brand:  "#5B8CFF",
        good:   "#35D07F",
        bad:    "#FF5B6E"
      }
    }
  },
  plugins: []
} satisfies Config;
