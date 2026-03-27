/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary:    '#034d73',
        cta:        '#0085ca',
        secondary:  '#cfefff',
        'bg-light': '#f8fafc',
        'text-main':'#0f172a',
        'text-muted':'#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
