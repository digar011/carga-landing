import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A3C5E',
          dark: '#142F4A',
          light: '#2A5A8A',
        },
        gold: {
          DEFAULT: '#C9922A',
          light: '#E0B05A',
          dark: '#A87820',
        },
        brand: {
          blue: '#2563A8',
          green: '#16A34A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};

export default config;
