/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./views/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', 'sans-serif'],
            },
            colors: {
                background: 'rgb(var(--color-background) / <alpha-value>)',
                surface: 'rgb(var(--color-surface) / <alpha-value>)',
                line: 'rgb(var(--color-line) / <alpha-value>)',
                toggle: 'rgb(var(--color-toggle) / <alpha-value>)',
                textMain: '#F9FAFB',   // Gray 50
                textSec: '#9CA3AF',    // Gray 400
                planes: '#60A5FA',     // Blue 400
                comer: '#FB923C',      // Orange 400
            }
        }
    },
    plugins: [],
}
