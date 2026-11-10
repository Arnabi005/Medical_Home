/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Blue Medical Palette
        lightblue: {
          50: '#f0f8ff',         // Soft light blue background
          100: '#e0f2fe',        // Light blue pill/badge tint
          200: '#bae6fd',        // Light blue border
          300: '#7dd3fc',        // Light blue focus ring / highlight
          400: '#38bdf8',        // Vibrant light blue
          500: '#0ea5e9',        // Primary Light Blue
          600: '#0284c7',        // Accessible Light Blue for buttons & text
          700: '#0369a1',        // Authoritative clinical blue
          800: '#075985',        // Dark blue for text & icons
          900: '#0c4a6e',        // Heading deep blue
          950: '#082f49',
        },
        // Mapped cerulean tokens to light blue
        cerulean: {
          50: '#f0f8ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Surfaces & Cards adapted for light blue UI
        jet: {
          DEFAULT: '#f0f8ff',
          black: '#f0f8ff',       // Clean light blue page base
          dark: '#ffffff',        // Crisp white header / panels
          surface: '#ffffff',     // White card with light blue borders
          card: '#f8fbfe',        // Soft light blue card
          elevated: '#f0f7fe',    // Popover / hover light blue
          border: '#bae6fd',      // Light blue border
          subtle: '#e0f2fe',      // Light blue divider
        },
        neonrose: {
          50: '#fff0f5',
          100: '#ffe2ec',
          200: '#ffb9d1',
          300: '#ff7fa9',
          400: '#ff4485',
          500: '#ff1464',         // Electric Neon Rose
          600: '#f00055',
          700: '#c80045',
          800: '#a3043a',
          900: '#870934',
          950: '#4c0019',
        },
        medicore: {
          50: '#f0f8ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        'lightblue-glow': '0 4px 20px -2px rgba(14, 165, 233, 0.25)',
        'neonrose-glow': '0 4px 20px -2px rgba(255, 20, 100, 0.3)',
        'lightblue-card': '0 4px 16px -2px rgba(14, 165, 233, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
