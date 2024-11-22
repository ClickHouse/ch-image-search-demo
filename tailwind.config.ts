import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        field_focus:
          "linear-gradient(0deg, #fbff46, #fbff46 2px, transparent 0, transparent)",
        navDropdown:
          "linear-gradient(to bottom, rgba(65, 65, 65, 0.3) 0px, rgba(65, 65, 65, 0.3) 1px, #282828 1px, #282828 44px, rgba(65, 65, 65, 0.3) 44px, rgba(65, 65, 65, 0.3)45px, #1F1F1C 45px, #1F1F1C 100%)",
        grid: 'url("/dot_grid.svg")',
        "click-grid": 'url("/bg-grid.svg")',
        "home-grid":
          'linear-gradient(117.08deg, rgba(0, 0, 0, 0) 14.55%, rgba(22, 22, 0, 0.167461) 34.15%, rgba(47, 47, 47, 0.22751) 40.54%, rgba(22, 22, 0, 0.611327) 46.65%, #161600 95.98%), url("/bg-grid.png");',
        "speed-lines": 'url("/speed-lines.svg")',
        "body-image": "linear-gradient(272.48deg, #292924 1.95%, #0F0F0F 100%)",
        "menu-options":
          "linear-gradient(255.48deg, rgba(41, 41, 36, 0.95) 1.95%, rgba(15, 15, 15, 0.95) 100%)",
      },
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
