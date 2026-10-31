import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.25rem",
          md: "1.5rem",
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#F7F4EC",
          100: "#EDF0E6",
          200: "#d8dbd2",
          300: "#9db8c0",
          400: "#66818d",
          500: "#53636c",
          600: "#23485b",
          700: "#102c3d",
          800: "#0c2230",
          900: "#081923",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
