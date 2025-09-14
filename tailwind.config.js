module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          light: '#d3f9d8',
          DEFAULT: '#34d399',
          dark: '#065f46',
        },
        ritual: {
          DEFAULT: '#f59e0b', // warm golden
        },
        cosmic: {
          DEFAULT: '#6366f1', // indigo glow
        },
      },
      keyframes: {
        zenpulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        cosmicglow: {
          '0%': { boxShadow: '0 0 5px #6366f1, 0 0 10px #6366f1' },
          '50%': { boxShadow: '0 0 20px #818cf8, 0 0 40px #818cf8' },
          '100%': { boxShadow: '0 0 5px #6366f1, 0 0 10px #6366f1' },
        },
      },
      animation: {
        zenpulse: 'zenpulse 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 4s ease-in-out infinite',
        cosmicglow: 'cosmicglow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
