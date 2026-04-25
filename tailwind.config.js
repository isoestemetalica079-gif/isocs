/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary accent (teal)
        accent: {
          50: '#e6f1f5',
          100: '#cce3eb',
          200: '#99c7d7',
          300: '#66abc3',
          400: '#338faf',
          500: '#1f7a95',
          600: '#186278',
          700: '#124a5b',
          800: '#0c323e',
          900: '#061a21',
        },
        // Semantic surfaces
        surface: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          hover: 'var(--bg-hover)',
          muted: 'var(--bg-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '14px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        sm: '0 1px 2px rgba(15, 23, 42, 0.04)',
        md: '0 4px 6px rgba(15, 23, 42, 0.1)',
        lg: '0 10px 15px rgba(15, 23, 42, 0.1)',
      },
    },
  },
  plugins: [],
}
