// @ts-ignore
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'wild-red': '#D72B2B',
        'wild-red-light': '#ffb4ac',
        'wild-red-dark': '#93000e',
        'wild-yellow': '#ffd65b',
        'wild-yellow-dark': '#e7b900',
        'wild-black': '#131313',
        'wild-black-light': '#1c1b1b',
        'wild-brown': '#1C1410',
        'wild-brown-light': '#2A2420',
        'wild-charcoal': '#2a2a2a',
        'wild-paper': '#F5F0E8',
        'wild-rust': '#8B3A1A',
        'wild-ember': 'rgba(215, 43, 43, 0.15)',
        'muncherz-red': '#D62828',
        'muncherz-yellow': '#F7B731',
        'muncherz-black': '#0A0A0A',
        'muncherz-white': '#FAFAFA',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      fontFamily: {
        'display': ['DM Sans', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'wild-sm': '0.25rem',
        'wild-default': '0.5rem',
        'wild-md': '0.75rem',
        'wild-lg': '1rem',
        'wild-xl': '1.5rem',
        'wild-card': '12px',
        'wild-sheet': '24px',
        'wild-button': '8px',
        'wild-pill': '9999px',
      },
      boxShadow: {
        'wild-glow': '0 0 20px rgba(215, 43, 43, 0.3)',
        'wild-ember': '0 4px 20px rgba(215, 43, 43, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config