import type { Config } from 'tailwindcss';
import { tailwindExtend } from '@beacon/theme';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...tailwindExtend,
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.95' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
