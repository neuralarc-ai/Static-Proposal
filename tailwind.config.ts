import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#262626',
        accent: '#E0693D',
        mint: '#D0EF5E',
        neural: '#A69CBE',
        solar: '#E7B31B',
        dataflow: '#A6C8D5',
        ion: '#EFB3AF',
        verdant: '#27584F',
      },
      fontFamily: {
        primary: ['var(--font-fustat)', 'Fustat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        secondary: ['var(--font-sora)', 'Sora', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['var(--font-fustat)', 'Fustat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        fustat: ['var(--font-fustat)', 'Fustat', 'sans-serif'],
        sora: ['var(--font-sora)', 'Sora', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}
export default config

