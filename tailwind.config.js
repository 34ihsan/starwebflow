/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue:    '#4F8EF7',
          purple:  '#8B5CF6',
          cyan:    '#06B6D4',
          emerald: '#10B981',
        },
        dark: {
          primary:   '#0A0A0F',
          secondary: '#0F0F1A',
          card:      '#12121F',
        },
      },
      animation: {
        'fade-in-up':    'fadeInUp 0.7s ease both',
        'fade-in-left':  'fadeInLeft 0.7s ease both',
        'fade-in-right': 'fadeInRight 0.7s ease both',
        'float':         'float 6s ease-in-out infinite',
        'orb-pulse':     'orbPulse 4s ease-in-out infinite',
        'orb-rotate':    'orbRotate 20s linear infinite',
        'orb-reverse':   'orbRotateReverse 15s linear infinite',
        'marquee':       'marquee 25s linear infinite',
        'shimmer':       'shimmer 4s linear infinite',
      },
      backgroundSize: {
        '200%': '200%',
      },
      boxShadow: {
        'glow-blue':   '0 0 30px rgba(79,142,247,0.25), 0 0 60px rgba(79,142,247,0.1)',
        'glow-purple': '0 0 30px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.1)',
        'glow-cyan':   '0 0 30px rgba(6,182,212,0.25), 0 0 60px rgba(6,182,212,0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
