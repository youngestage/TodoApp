/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tangerine: {
          DEFAULT: '#EF713F',
          50: '#FFF5F0',
          100: '#FDEAE1',
          200: '#FCD2C2',
          300: '#F9AC94',
          400: '#F48663',
          500: '#EF713F',
          600: '#D95220',
          700: '#B53D16',
          800: '#913318',
        },
        saffron: {
          DEFAULT: '#E9C277',
          50: '#FAF6EB',
          100: '#F5ECCF',
          200: '#EDD99F',
          300: '#E9C277',
          400: '#DFAA4D',
          500: '#CF9130',
        },
        wisteria: {
          DEFAULT: '#BEABD8',
          50: '#F6F3FA',
          100: '#ECE6F4',
          200: '#D8CDE7',
          300: '#BEABD8',
          400: '#A184C4',
          500: '#8964B3',
        },
        canvas: '#FBF9F5',
        card: '#FFFFFF',
        borderWarm: 'transparent',
        espresso: '#231F1E',
        mutedSlate: '#6B6560',
        sage: {
          DEFAULT: '#4A7C59',
          light: '#EBF3ED',
          dark: '#386044',
        }
      },
      fontFamily: {
        display: ['Quicksand', 'sans-serif'],
        sans: ['Quicksand', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        zodiak: ['Quicksand', 'sans-serif'],
      },
      boxShadow: {
        warm: 'none',
        'warm-hover': 'none',
        'warm-glow': 'none',
        nav: '0 4px 20px rgba(35, 31, 30, 0.06)',
      }
    },
  },
  plugins: [],
}
