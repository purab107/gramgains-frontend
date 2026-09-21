/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          primary: "#0f8651",
          dark: "#0d7649",
          light: "#e4f7ee",
        },
        macro: {
          protein: "#8b5cf6",
          carb: "#f15359",
          fats: "#feb111",
        },
        green: {
          dark: "#0d7649",
          DEFAULT: "#0f8651",
          light: "#e4f7ee",
          light2: "#a8ecca",
          light3: "#4cd593",
        },
        brand: {
          bg: "#fcfdfe",
          card: "#fefeff",
          text: "#171C1B",
          muted: "#68716F",
          border: "#e5e7eb",
        },
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
          border: "var(--accent-border)",
          foreground: "var(--accent-foreground)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--surface-3)",
          foreground: "var(--accent)",
        },
        destructive: {
          DEFAULT: "#f15359",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--surface-3)",
          foreground: "var(--text-secondary)",
        },
        popover: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-primary)",
        },
        sidebar: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
          primary: "var(--accent)",
          "primary-foreground": "#FFFFFF",
          accent: "var(--accent-muted)",
          "accent-foreground": "var(--accent)",
          border: "var(--border)",
          ring: "var(--accent)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
