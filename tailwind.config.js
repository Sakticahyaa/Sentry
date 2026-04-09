/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        meroket: '#E74C3C',
        thesis: '#F1C40F',
        yutaka: '#1ABC9C',
        roetix: '#8E44AD',
        batin: '#1ABC9C',
        hyke: '#3498DB',
      },
    },
  },
  plugins: [],
}
