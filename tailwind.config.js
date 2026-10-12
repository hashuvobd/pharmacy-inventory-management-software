/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        textMain: '#1E293B',
        textMuted: '#64748B',
        primary: '#3B82F6',
        primaryHover: '#2563EB',
        accent: '#10B981',
        accentHover: '#059669',
        border: '#E2E8F0',
        inputBg: '#F1F5F9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
