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
          primary: "#0A7C6E",
          dark: "#075E54",
          light: "#E6F3F1",
        },
        brand: {
          bg: "#F7F9F8",
          card: "#FFFFFF",
          text: "#171C1B",
          muted: "#68716F",
          border: "#E1E7E5",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0A7C6E",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E6F3F1",
          foreground: "#075E54",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#E6F3F1",
          foreground: "#68716F",
        },
        accent: {
          DEFAULT: "#E6F3F1",
          foreground: "#075E54",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#171C1B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#171C1B",
        },
        sidebar: {
          DEFAULT: "#171C1B",
          foreground: "#F7F9F8",
          primary: "#0A7C6E",
          "primary-foreground": "#FFFFFF",
          accent: "#232A29",
          "accent-foreground": "#FFFFFF",
          border: "#2B3331",
          ring: "#0A7C6E",
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
