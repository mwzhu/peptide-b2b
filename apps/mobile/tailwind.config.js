const { tailwindExtend } = require('@beacon/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tailwindExtend.colors,
      borderRadius: tailwindExtend.borderRadius,
      fontSize: tailwindExtend.fontSize,
      fontFamily: {
        display: ['Fraunces'],
        'display-medium': ['FrauncesMedium'],
        'display-semibold': ['FrauncesSemibold'],
        sans: ['Inter'],
        'sans-medium': ['InterMedium'],
        'sans-semibold': ['InterSemibold'],
        'sans-bold': ['InterBold'],
      },
    },
  },
  plugins: [],
};
