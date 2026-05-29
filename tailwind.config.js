/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0F2A24',
          800: '#173A33',
          700: '#1A3C34',
          600: '#245249',
          500: '#2D6A4F',
          400: '#4D8A6F',
          300: '#7FB196',
          200: '#B7DEC8',
          100: '#D8ECDF',
          50:  '#ECF5EF',
          25:  '#F4FAF6',
        },
        ink: {
          900: '#0B0F0D',
          800: '#1A1A1A',
          700: '#2E3733',
          600: '#4B5650',
          500: '#6B7280',
          400: '#9AA3A0',
          300: '#C9CFCC',
          200: '#E2E6E4',
          100: '#EEF1EF',
          50:  '#F6F8F7',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ["'Noto Sans KR'", 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        sm:    '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
        md:    '0 4px 8px -2px rgba(15,42,36,0.06), 0 2px 4px -2px rgba(15,42,36,0.04)',
        lg:    '0 12px 24px -8px rgba(15,42,36,0.10), 0 4px 8px -4px rgba(15,42,36,0.06)',
        xl:    '0 24px 48px -12px rgba(15,42,36,0.18)',
        focus: '0 0 0 3px rgba(45,106,79,0.25)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
