/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Fuente limpia y legible
      },
      colors: {
        // Paleta "Deep Corporate"
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9', // Azul vibrante para acciones
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e', // Azul marino profundo
        },
        slate: {
          800: '#1e293b', // Fondos oscuros elegantes
          900: '#0f172a', // Casi negro
        },
        gold: {
          500: '#eab308', // Detalles de victoria/premio
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}