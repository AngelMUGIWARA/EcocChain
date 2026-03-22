import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        grotesk: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      colors: {
        // EcoTracer brand tokens — single source of truth
        EcoTracer: {
          primary:   "#09291D",
          secondary: "#FCFAEB",
          accent:    "#C8A97A",
          muted:     "#705B3D",
          surface:   "#F0EEDF",
          border:    "#E5E3D4",
        },

        // Shadcn/ui semantic tokens (mapped to brand palette)
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "#FCFAEB",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT:         "#FCFAEB",
          bright:          "#FCFAEB",
          container:       "#F0EEDF",
          "container-high": "#E8E6D7",
        },
        primary: {
          DEFAULT:      "#09291D",
          foreground:   "#FFFFFF",
          container:    "#09291D",
          "on-container": "#FFFFFF",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: {
          DEFAULT:    "#A68E6B",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "#C8A97A",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "#FCFAEB",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        token: {
          DEFAULT:    "#09291D",
          foreground: "#FFFFFF",
        },
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", filter: "blur(4px)", transform: "translateY(16px)" },
          to:   { opacity: "1", filter: "blur(0px)", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "pulse-token": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsla(33, 45%, 54%, 0.4)" },
          "50%":       { boxShadow: "0 0 0 8px hsla(33, 45%, 54%, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in":       "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-token":    "pulse-token 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
