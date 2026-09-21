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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0f8651",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#e4f7ee",
          foreground: "#0d7649",
        },
        destructive: {
          DEFAULT: "#f15359",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#e4f7ee",
          foreground: "#68716F",
        },
        accent: {
          DEFAULT: "#e4f7ee",
          foreground: "#0d7649",
        },
        popover: {
          DEFAULT: "#fefeff",
          foreground: "#171C1B",
        },
        card: {
          DEFAULT: "#fefeff",
          foreground: "#171C1B",
        },
        sidebar: {
          DEFAULT: "#1a875c",
          foreground: "#FFFFFF",
          primary: "#0d7649",
          "primary-foreground": "#FFFFFF",
          accent: "#0d7649",
          "accent-foreground": "#FFFFFF",
          border: "#0d7649",
          ring: "#0f8651",
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
