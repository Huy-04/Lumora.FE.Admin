import type { Config } from "tailwindcss";

const colorVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export default <Partial<Config>>{
  darkMode: "class",
  content: [
    "./app.vue",
    "./features/**/*.{vue,js,ts}",
    "./Shared/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        cream: colorVar("--cream-rgb"),
        alabaster: colorVar("--alabaster-rgb"),
        pearl: colorVar("--pearl-rgb"),
        charcoal: colorVar("--charcoal-rgb"),
        taupe: colorVar("--taupe-rgb"),
        champagne: colorVar("--champagne-rgb"),
        "deep-champagne": colorVar("--deep-champagne-rgb"),
        "greige-line": colorVar("--greige-line-rgb"),
        linen: colorVar("--linen-rgb"),
        parchment: colorVar("--parchment-rgb"),
        sand: colorVar("--sand-rgb"),
        ink: colorVar("--ink-rgb"),
        smoke: colorVar("--smoke-rgb"),
        line: colorVar("--line-rgb"),
        ember: colorVar("--ember-rgb"),
        success: colorVar("--success-rgb"),
        danger: colorVar("--danger-rgb"),
        warning: colorVar("--warning-rgb"),
        brass: colorVar("--brass-rgb"),
        obsidian: colorVar("--obsidian-rgb"),
        oat: colorVar("--oat-rgb"),
        primary: colorVar("--primary-rgb"),
        "surface-muted": colorVar("--surface-muted-rgb"),
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "16px",
        lg: "22px",
        xl: "28px",
        "2xl": "36px",
      },
      boxShadow: {
        haze: "0 24px 58px -40px rgba(23, 28, 26, 0.18)",
        panel: "0 28px 80px -44px rgba(23, 28, 26, 0.24)",
        float: "0 18px 46px -32px rgba(23, 28, 26, 0.18)",
      },
      backgroundImage: {
        paper: "linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 246, 241, 0.9) 100%)",
        vellum: "linear-gradient(180deg, rgba(251, 252, 250, 0.96) 0%, rgba(232, 239, 233, 0.88) 100%)",
      },
    },
  },
  plugins: [],
};
