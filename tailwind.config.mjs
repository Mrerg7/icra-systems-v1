/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'icra-teal': '#0D9488',
        'icra-deep': '#0F766E',
        'icra-teal-bright': '#14B8A6',
        'icra-teal-pale': '#CCFBF1',
        'icra-surface': '#f8fafc',
        'icra-dark': '#0F172A',
        'icra-dark-accent': '#134E4A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
