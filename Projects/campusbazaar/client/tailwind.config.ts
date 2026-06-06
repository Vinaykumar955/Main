import type { Config } from "tailwindcss";

/**
 * Tailwind tokens are wired to CSS variables defined in `src/styles/index.css`.
 * That way the user's theme choice (dark/light) and accent pick re-skin the
 * entire app by toggling classes / inline style on <html> — no rebuild needed.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // === Base canvas ===
        ink: {
          DEFAULT: "var(--color-bg)",
          50: "var(--color-bg-4)",
          100: "var(--color-bg-2)",
          200: "var(--color-bg-3)",
          300: "var(--color-bg)",
          400: "var(--color-bg)",
          500: "var(--color-bg-5)",
        },
        paper: {
          DEFAULT: "var(--color-paper)",
          50: "var(--color-paper-50)",
          100: "var(--color-paper-100)",
          200: "var(--color-paper-200)",
          300: "var(--color-paper-300)",
          400: "var(--color-paper-400)",
          500: "var(--color-paper-500)",
        },
        // === Surface ===
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          sunken: "var(--color-surface-sunken)",
          overlay: "var(--color-surface-overlay)",
        },
        // === Text ===
        fg: {
          DEFAULT: "var(--color-fg)",
          muted: "var(--color-fg-muted)",
          subtle: "var(--color-fg-subtle)",
          ghost: "var(--color-fg-ghost)",
        },
        // === Borders ===
        line: {
          DEFAULT: "var(--color-line)",
          strong: "var(--color-line-strong)",
          subtle: "var(--color-line-subtle)",
        },
        // === Signal (accent) ===
        signal: {
          DEFAULT: "var(--color-signal)",
          50: "var(--color-signal-50)",
          100: "var(--color-signal-100)",
          200: "var(--color-signal-200)",
          300: "var(--color-signal-300)",
          400: "var(--color-signal-400)",
          500: "var(--color-signal-500)",
          600: "var(--color-signal-600)",
          700: "var(--color-signal-700)",
          800: "var(--color-signal-800)",
          900: "var(--color-signal-900)",
        },
        cyan: {
          DEFAULT: "var(--color-cyan)",
          50: "var(--color-cyan-50)",
          100: "var(--color-cyan-100)",
          200: "var(--color-cyan-200)",
          300: "var(--color-cyan-300)",
          400: "var(--color-cyan-400)",
          500: "var(--color-cyan-500)",
          600: "var(--color-cyan-600)",
          700: "var(--color-cyan-700)",
          800: "var(--color-cyan-800)",
          900: "var(--color-cyan-900)",
        },
        // === Semantic ===
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-cyan)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["Departure Mono", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem", letterSpacing: "0.05em" }],
        xs: ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.04em" }],
        sm: ["0.8125rem", { lineHeight: "1.125rem", letterSpacing: "0.02em" }],
        base: ["0.9375rem", { lineHeight: "1.375rem" }],
        lg: ["1.0625rem", { lineHeight: "1.5rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["2rem", { lineHeight: "2.5rem" }],
        "4xl": ["2.5rem", { lineHeight: "3rem" }],
        "5xl": ["3.5rem", { lineHeight: "4rem" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.02em",
        wider: "0.05em",
        widest: "0.1em",
        ultra: "0.2em",
      },
      borderRadius: {
        none: "0",
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        "2xl": "20px",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        hairline: "inset 0 0 0 1px var(--alpha-fg-soft)",
        "hairline-strong": "inset 0 0 0 1px var(--alpha-fg-strong)",
        glow: "0 0 0 1px color-mix(in oklab, var(--color-signal) 20%, transparent), 0 0 24px -4px color-mix(in oklab, var(--color-signal) 40%, transparent)",
        "glow-cyan": "0 0 0 1px color-mix(in oklab, var(--color-cyan) 20%, transparent), 0 0 24px -4px color-mix(in oklab, var(--color-cyan) 40%, transparent)",
        panel: "0 1px 0 0 var(--alpha-fg-soft) inset, 0 0 0 1px var(--alpha-fg-faint)",
        "panel-raised": "0 24px 48px -12px rgb(0 0 0 / 0.6), 0 0 0 1px var(--alpha-fg-strong)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "blink-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "glitch-x": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-1px, 1px)" },
          "40%": { transform: "translate(-1px, -1px)" },
          "60%": { transform: "translate(1px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 color-mix(in oklab, var(--color-signal) 60%, transparent)" },
          "100%": { boxShadow: "0 0 0 8px color-mix(in oklab, var(--color-signal) 0%, transparent)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        ticker: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
        "scan-line": "scan-line 8s linear infinite",
        "blink-dot": "blink-dot 1.4s ease-in-out infinite",
        "glitch-x": "glitch-x 0.2s steps(4) 1",
        "fade-in": "fade-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        "slide-in-up": "slide-in-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        "pulse-ring": "pulse-ring 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 1",
        marquee: "marquee 60s linear infinite",
        ticker: "ticker 30s linear infinite",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.2, 0.8, 0.2, 1)",
        "in-out-quart": "cubic-bezier(0.7, 0, 0.3, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "0": "0ms",
        DEFAULT: "150ms",
        "75": "75ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle, var(--alpha-fg-soft) 1px, transparent 1px)",
        "dot-grid-light":
          "radial-gradient(circle, rgb(10 10 10 / 0.06) 1px, transparent 1px)",
        grid:
          "linear-gradient(var(--alpha-fg-faint) 1px, transparent 1px), linear-gradient(90deg, var(--alpha-fg-faint) 1px, transparent 1px)",
        scanlines:
          "repeating-linear-gradient(0deg, var(--alpha-fg-faint) 0px, var(--alpha-fg-faint) 1px, transparent 1px, transparent 3px)",
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4' /%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        "dot-sm": "8px 8px",
        "dot-md": "16px 16px",
        "dot-lg": "24px 24px",
        "grid-sm": "16px 16px",
        "grid-md": "32px 32px",
        "grid-lg": "64px 64px",
      },
    },
  },
  plugins: [],
};

export default config;
