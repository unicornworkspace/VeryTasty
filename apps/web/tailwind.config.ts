import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          light: 'var(--bg-light)',
          dark: 'var(--bg-dark)',
          'card-dark': 'var(--bg-card-dark)',
        },
        surface: 'var(--surface)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          pressed: 'var(--accent-pressed)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          inverse: 'var(--text-inverse)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        h2: ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        h3: ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.5' }],
        small: ['14px', { lineHeight: '1.4' }],
        caption: ['12px', { lineHeight: '1.3' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      spacing: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        24: '24px',
        32: '32px',
        40: '40px',
        48: '48px',
        64: '64px',
        80: '80px',
        96: '96px',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        250: '250ms',
        300: '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
