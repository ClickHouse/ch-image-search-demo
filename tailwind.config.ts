import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'smooth-scroll': 'smooth-scroll 10s linear forwards',
      },
      keyframes: {
        'smooth-scroll': {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
