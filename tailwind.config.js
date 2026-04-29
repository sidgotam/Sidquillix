/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0f172a',
        ink: {
          950: '#050816',
        },
        glass: 'rgba(255,255,255,0.06)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 18px 60px rgba(0,0,0,0.55)',
        soft: '0 10px 30px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial'],
      },
      backgroundImage: {
        'sidquillix-radial':
          'radial-gradient(900px circle at 15% 10%, rgba(168,85,247,0.25), transparent 55%), radial-gradient(800px circle at 85% 0%, rgba(59,130,246,0.22), transparent 55%), radial-gradient(600px circle at 60% 90%, rgba(99,102,241,0.18), transparent 55%)',
      },
    },
  },
  plugins: [],
}

