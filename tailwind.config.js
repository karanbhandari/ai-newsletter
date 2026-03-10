/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pulse: {
          bg: '#0e0e0a',
          surface: '#161610',
          border: '#2a2a1e',
          text: '#f5f0e0',
          secondary: '#d4c9a8',
          muted: '#888',
          accent: '#f0a500',
          'accent-subtle': 'rgba(240, 165, 0, 0.1)',
          danger: '#e05050',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
