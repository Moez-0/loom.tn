import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        loom: {
          black: '#0B0B0B',
          white: '#FFFFFF',
          'off-white': '#0B0B0B',
          surface: '#111111',
          'surface-2': '#151515',
          'surface-3': '#1B1B1B',
          border: '#1E1E1E',
          'border-dark': '#2A2A2A',
          'border-dk': '#2A2A2A',
          muted: '#888888',
          faint: '#A0A0A0',
          accent: '#0067B0',
          'accent-dk': '#005793',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          pending: '#FACC15',
        },
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
      },
      letterSpacing: {
        label: '0.12em',
        wide: '0.06em',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
}

export default config
