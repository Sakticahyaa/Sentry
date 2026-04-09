/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Branch colors
        meroket: '#E74C3C',
        thesis: '#C9A84C',
        yutaka: '#1ABC9C',
        roetix: '#8E44AD',
        batin: '#1ABC9C',
        hyke: '#5B6B8A',

        // Theme-aware semantic tokens (auto-switch via CSS vars)
        t: {
          surface:      'var(--t-surface)',
          card:         'var(--t-card)',
          elevated:     'var(--t-elevated)',
          input:        'var(--t-input)',
          hover:        'var(--t-hover)',
          border:       'var(--t-border)',
          text:         'var(--t-text)',
          text2:        'var(--t-text2)',
          text3:        'var(--t-text3)',
          text4:        'var(--t-text4)',
          accent:       'var(--t-accent)',
          'accent-sub': 'var(--t-accent-sub)',
          gold:         'var(--t-gold)',
          'gold-sub':   'var(--t-gold-sub)',
        },
      },
    },
  },
  plugins: [],
}
