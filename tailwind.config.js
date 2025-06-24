/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',      // Coffee Brown
        secondary: '#F5F5DC',    // Warm Cream
        accent: '#228B22',       // Forest Green
        success: '#10B981',      // Green
        warning: '#F59E0B',      // Amber
        muted: '#6B7280',        // Gray
        border: '#E5E7EB',       // Light Gray
        background: '#FAFAFA',   // Off-white
        foreground: '#36454F',   // Charcoal
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 