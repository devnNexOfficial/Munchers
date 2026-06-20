import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'muncherz-red': '#D62828',
        'muncherz-yellow': '#F7B731',
        'muncherz-black': '#0A0A0A',
        'muncherz-white': '#FAFAFA',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
        'complexity-green': '#22C55E',
        'complexity-yellow': '#F59E0B',
        'complexity-red': '#EF4444',
      },
    },
  },
  plugins: [],
}
export default config
