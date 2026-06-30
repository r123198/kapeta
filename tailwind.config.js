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
        primary: '#222222',
        secondary: '#5d5f5f',
        'border-subtle': '#E5E5E5',
        surface: '#fdf8f8',
        'surface-alt': '#F8F8F8',
        'canvas-white': '#FFFFFF',
        'on-surface': '#1c1b1b',
        'on-surface-variant': '#444748',
        'surface-container': '#f1edec',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f7f3f2',
        'surface-container-high': '#ebe7e7',
        'surface-container-highest': '#e5e2e1',
        outline: '#747878',
        'outline-variant': '#c4c7c7',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-primary': '#ffffff',
        'on-primary-container': '#8a8989',
        'tertiary-container': '#232221',
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
        full: '0px',
      },
      spacing: {
        'stack-sm': '0.5rem',
        'stack-md': '1rem',
        'stack-lg': '2rem',
        'grid-margin': '2rem',
        'grid-gutter': '1px',
        'container-padding': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        hanken: ['Hanken Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}