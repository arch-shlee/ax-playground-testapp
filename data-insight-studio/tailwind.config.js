/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      colors: {
        navy: {
          DEFAULT: '#1e3a5f',
          50: '#eef3f8',
          100: '#d6e2ee',
          600: '#274a72',
          700: '#1e3a5f',
          800: '#152a45',
          900: '#0d1b2e',
        },
        status: {
          normal: '#0d9488',
          warning: '#ea580c',
          delayed: '#dc2626',
        },
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
