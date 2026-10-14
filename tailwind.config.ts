import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Apple iOS + Muted Lavender/Indigo Theme Foundation
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#6366f1", // Sophisticated Indigo / Muted Lavender
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          DEFAULT: "#6366f1",
          lavender: "#8b5cf6",
          subtle: "#ede9fe",
        },
        surface: {
          base: "#f8fafc",      // Apple light canvas
          card: "#ffffff",      // Apple card surface
          elevated: "#ffffff",
          subtle: "#f1f5f9",    // Apple grouped section fill
          muted: "#e2e8f0",
          border: "#e2e8f0",    // Apple hairline border
          borderSubtle: "rgba(0, 0, 0, 0.05)",
          // Backward compatibility mappings
          light: "#ffffff",
          dark: "#f8fafc",
          cardHover: "#ffffff",
          darkBorder: "#e2e8f0",
          darkMuted: "#64748b",
        },
        text: {
          primary: "#0f172a",   // Apple dark charcoal label
          secondary: "#475569", // Apple secondary label
          muted: "#94a3b8",     // Tertiary muted
        },
        income: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          DEFAULT: "#10b981",
          subtle: "#ecfdf5",
        },
        expense: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          DEFAULT: "#f43f5e",
          subtle: "#fff1f2",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          DEFAULT: "#f59e0b",
          subtle: "#fef3c7",
        },

        // Cute Subtle Anime Accents (Pastel, warm, charming)
        cute: {
          sakura: "#fce7f3",
          lavender: "#ede9fe",
          sky: "#e0f2fe",
          mint: "#d1fae5",
          peach: "#ffedd5",
          cream: "#fefce8",
        },

        // Legacy compatibility mappings
        water: {
          cyan: "#0284c7",
          teal: "#0d9488",
          surface: "rgba(2, 132, 199, 0.08)",
          glow: "transparent",
        },
        sun: {
          crimson: "#e11d48",
          orange: "#ea580c",
          amber: "#d97706",
          surface: "rgba(225, 29, 72, 0.08)",
          glow: "transparent",
        },
        thunder: {
          yellow: "#ca8a04",
          gold: "#d97706",
          surface: "rgba(202, 138, 4, 0.08)",
          glow: "transparent",
        },
        bounty: {
          gold: "#d97706",
          amber: "#b45309",
          bronze: "#92400e",
          surface: "rgba(217, 119, 6, 0.08)",
          glow: "transparent",
        },
        system: {
          blue: "#4f46e5",
          cyan: "#0284c7",
          indigo: "#6366f1",
          surface: "rgba(99, 102, 241, 0.08)",
        },
        abyss: {
          950: "#ffffff",
          black: "#f8fafc",
          900: "#ffffff",
          800: "#f1f5f9",
          700: "#e2e8f0",
          600: "#cbd5e1",
          border: "#e2e8f0",
          "border-glow": "rgba(99, 102, 241, 0.15)",
        },
      },

      borderRadius: {
        "2xl": "1rem",     // 16px
        "3xl": "1.5rem",   // 24px
        "4xl": "2rem",     // 32px
      },

      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Inter", "sans-serif"],
        rpg: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "sans-serif"],
        numbers: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "tabular-nums", "Inter", "sans-serif"],
        tech: ["var(--font-inter)", "-apple-system", "monospace"],
      },

      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 4px 12px 0 rgba(0, 0, 0, 0.02)",
        "card-hover": "0 4px 12px 0 rgba(0, 0, 0, 0.06), 0 8px 24px 0 rgba(0, 0, 0, 0.03)",
        modal: "0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
        popover: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -3px rgba(0, 0, 0, 0.04)",
        "focus-ring": "0 0 0 3px rgba(99, 102, 241, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
