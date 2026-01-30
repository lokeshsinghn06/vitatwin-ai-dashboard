/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark industrial theme
                gunmetal: {
                    900: '#1a1d21',
                    800: '#22262b',
                    700: '#2a2f36',
                    600: '#353b44',
                    500: '#414952',
                },
                slate: {
                    950: '#0f1115',
                    900: '#15181d',
                    850: '#1c2027',
                },
                // Accent colors
                success: {
                    DEFAULT: '#22c55e',
                    dark: '#16a34a',
                    light: '#4ade80',
                },
                emergency: {
                    DEFAULT: '#ef4444',
                    dark: '#dc2626',
                    light: '#f87171',
                },
                warning: {
                    DEFAULT: '#eab308',
                    dark: '#ca8a04',
                    light: '#facc15',
                },
                control: {
                    DEFAULT: '#3b82f6',
                    dark: '#2563eb',
                    light: '#60a5fa',
                },
                // Brushed metal accents
                metal: {
                    light: '#6b7280',
                    DEFAULT: '#4b5563',
                    dark: '#374151',
                    border: '#3f4754',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'inner-lg': 'inset 0 2px 10px 0 rgba(0, 0, 0, 0.4)',
                'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                'button': '0 2px 4px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
                'button-pressed': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
            },
            backgroundImage: {
                'metal-gradient': 'linear-gradient(135deg, #2a2f36 0%, #1a1d21 50%, #22262b 100%)',
                'nav-gradient': 'linear-gradient(180deg, #353b44 0%, #2a2f36 100%)',
            },
        },
    },
    plugins: [],
}
