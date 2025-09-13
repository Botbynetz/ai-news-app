/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  safelist: [
    'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-700', 'bg-gray-800',
    'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-300',
    'dark:bg-gray-800', 'dark:bg-gray-900', 'dark:text-gray-100', 'dark:text-gray-300'
  ],
  plugins: [],
};
