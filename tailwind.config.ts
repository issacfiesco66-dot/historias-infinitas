import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        // Paleta solemne: blanco, gris pizarra, dorado tenue
        marfil: {
          DEFAULT: '#FBF9F4',
          50: '#FEFDFB',
          100: '#FBF9F4',
          200: '#F4EFE4',
        },
        pizarra: {
          DEFAULT: '#2E3440',
          50: '#F7F8FA',
          100: '#E5E9F0',
          200: '#D8DEE9',
          300: '#A7B0BE',
          400: '#6B7280',
          500: '#4C566A',
          600: '#3B4252',
          700: '#2E3440',
          800: '#1F242E',
          900: '#12151B',
        },
        dorado: {
          DEFAULT: '#B7945A',
          50: '#FAF5EC',
          100: '#F1E6CC',
          200: '#E2CC99',
          300: '#D1B26F',
          400: '#C2A063',
          500: '#B7945A',
          600: '#8F7245',
          700: '#6B5534',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out forwards',
        'glow': 'glow 3s ease-in-out infinite',
      },
      boxShadow: {
        'solemn': '0 10px 40px -10px rgba(46, 52, 64, 0.18)',
        'dorado': '0 0 30px -5px rgba(183, 148, 90, 0.35)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
