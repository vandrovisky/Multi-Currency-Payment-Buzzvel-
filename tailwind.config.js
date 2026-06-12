import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Geist', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(12px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                aurora: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(8%, -6%) scale(1.15)' },
                    '66%': { transform: 'translate(-6%, 8%) scale(0.95)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.5s ease-out both',
                aurora: 'aurora 14s ease-in-out infinite',
            },
        },
    },

    plugins: [forms],
};
