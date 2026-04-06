/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
      colors: {
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        'bg-base': 'var(--bg-base)',
        'bg-hover': 'var(--bg-hover)',
        'border-subtle': 'var(--border-subtle)',
        'border-muted': 'var(--border-muted)',
        'accent-blue': 'var(--accent-blue)',
        'accent-green': 'var(--accent-green)',
        'accent-red': 'var(--accent-red)',
        'accent-orange': 'var(--accent-orange)',
        'accent-purple': 'var(--accent-purple)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'fade-slide-up': 'fadeSlideUp 0.4s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
