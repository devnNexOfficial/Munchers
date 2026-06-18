import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'muncherz-red': 'var(--muncherz-red)',
        'muncherz-yellow': 'var(--muncherz-yellow)',
        'muncherz-black': 'var(--muncherz-black)',
        'muncherz-white': 'var(--muncherz-white)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
        'info': 'var(--info)',
        'complexity-green': 'var(--complexity-green)',
        'complexity-yellow': 'var(--complexity-yellow)',
        'complexity-red': 'var(--complexity-red)',
      },
      backgroundColor: {
        'primary': '#D62828',
        'secondary': '#F7B731',
        'dark': '#0A0A0A',
        'light': '#FAFAFA',
      },
      textColor: {
        'primary': '#D62828',
        'secondary': '#F7B731',
        'dark': '#0A0A0A',
        'light': '#FAFAFA',
      },
      borderColor: {
        'primary': '#D62828',
        'secondary': '#F7B731',
      },
      animation: {
        'implode': 'implode 0.4s ease-in-out forwards',
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
      },
      keyframes: {
        implode: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.3)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
