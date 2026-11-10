/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8edf5',
          100: '#c5d0e6',
          200: '#9fb0d4',
          300: '#7890c2',
          400: '#5c77b5',
          500: '#3f5ea8',
          600: '#2d4a8f',
          700: '#1e3570',
          800: '#0f2252',
          900: '#0B1E3D',
          950: '#070f1e',
        },
        electric: {
          50: '#e3f0fc',
          100: '#bad9f7',
          200: '#8bc0f3',
          300: '#5ba7ee',
          400: '#3594eb',
          500: '#1565C0',
          600: '#1255a4',
          700: '#0e4388',
          800: '#0a326d',
          900: '#062252',
        },
        brand: {
          orange: '#FF6B00',
          yellow: '#FFC107',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.15)',
        'navy': '0 4px 20px rgba(11,30,61,0.3)',
        'electric': '0 4px 20px rgba(21,101,192,0.3)',
      }
    },
  },
  plugins: [],
}
