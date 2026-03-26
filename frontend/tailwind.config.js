/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#1b262c",
        surface: "#22343c",
        primary: "#0f4c75",
        primaryHover: "#3282b8",
        textMain: "#e8f1f8",
        textSoft: "#bbe1fa",
        accent: "#d4af37",
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(15, 76, 117, 0.4)',
        'glow-accent': '0 0 15px rgba(212, 175, 55, 0.3)',
        'glow-green': '0 0 10px rgba(34, 197, 94, 0.5)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'stagger-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    }
  },
  plugins: [],
}