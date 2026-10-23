import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        danger: { DEFAULT: 'hsl(var(--danger))', foreground: 'hsl(var(--danger-foreground))' },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
      },
      borderRadius: { lg: '0.5rem', xl: '0.75rem', '2xl': '1rem' },
      boxShadow: { ink: '4px 4px 0 hsl(var(--foreground))', 'ink-sm': '2px 2px 0 hsl(var(--foreground))' },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: { float: 'float 4s ease-in-out infinite' },
    },
  },
  plugins: [animate],
};

export default config;
