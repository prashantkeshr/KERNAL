/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'k-bg':           '#0e1116',
        'k-surface':      '#1a1f2b',
        'k-surface-2':    '#252c3b',
        'k-border':       '#2d3748',
        'k-text':         '#e2e8f0',
        'k-muted':        '#a0aec0',
        'k-accent':       '#4fd1c5',
        'k-accent-dark':  '#2c7a7b',
        'k-danger':       '#f87171',
        'k-warning':      '#fbbf24',
        'k-success':      '#4ade80',
        'k-code-bg':      '#0b0e14',
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'kernal': '12px',
      },
      boxShadow: {
        'kernal': '0 10px 25px -5px rgba(0,0,0,0.5)',
        'kernal-sm': '0 4px 12px -2px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-in': 'slideIn 0.2s ease',
        'slide-up': 'slideUp 0.2s ease',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(-8px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
