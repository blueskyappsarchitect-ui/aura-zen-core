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
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        timeline: "hsl(var(--timeline))",
        "timeline-marker": "hsl(var(--timeline-marker))",
        glass: {
          bg: "hsl(var(--glass-bg))",
          border: "hsl(var(--glass-border))",
          glow: "hsl(var(--glass-glow))",
        },
        category: {
          study: "hsl(var(--category-study))",
          "study-foreground": "hsl(var(--category-study-foreground))",
          personal: "hsl(var(--category-personal))",
          "personal-foreground": "hsl(var(--category-personal-foreground))",
          rest: "hsl(var(--category-rest))",
          "rest-foreground": "hsl(var(--category-rest-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'glow': 'var(--shadow-glow)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "well-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(34, 211, 238, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)" },
        },
        "well-glow-thirsty": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(217, 119, 6, 0.4), 0 0 40px rgba(234, 88, 12, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(217, 119, 6, 0.6), 0 0 60px rgba(234, 88, 12, 0.3)" },
        },
        "water-ripple": {
          "0%": { width: "20px", height: "20px", opacity: "1" },
          "100%": { width: "200px", height: "200px", opacity: "0" },
        },
        "water-drop": {
          "0%": { transform: "translate(-50%, -50%) rotate(var(--drop-angle)) translateY(0)", opacity: "1" },
          "100%": { transform: "translate(-50%, -50%) rotate(var(--drop-angle)) translateY(-80px)", opacity: "0" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "seasonal-fall": {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(360deg)", opacity: "0" },
        },
        "shimmer-slow": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "glimmer-sparkle": {
          "0%, 100%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1) rotate(180deg)" },
        },
        "breathing-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        "spotlight-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "well-glow": "well-glow 2s ease-in-out infinite",
        "well-glow-thirsty": "well-glow-thirsty 1.5s ease-in-out infinite",
        "water-ripple": "water-ripple 0.8s ease-out forwards",
        "water-drop": "water-drop 0.6s ease-out forwards",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "seasonal-fall": "seasonal-fall 8s linear infinite",
        "shimmer-slow": "shimmer-slow 3s ease-in-out infinite",
        "glimmer-sparkle": "glimmer-sparkle 2s ease-in-out infinite",
        "breathing-pulse": "breathing-pulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spotlight-pulse": "spotlight-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
