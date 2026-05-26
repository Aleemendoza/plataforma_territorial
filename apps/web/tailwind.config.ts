import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#06070A",
        surface: "#0E1117",
        panel: "#101722",
        line: "#1B2738",
        water: "#27B3FF",
        riskLow: "#31C46C",
        riskMedium: "#E8C547",
        riskHigh: "#F08A24",
        riskCritical: "#F04452"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(0, 0, 0, 0.35)"
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at top, rgba(39, 179, 255, 0.12), transparent 35%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"
      },
      backgroundSize: {
        "grid-fade": "auto, 28px 28px, 28px 28px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;

