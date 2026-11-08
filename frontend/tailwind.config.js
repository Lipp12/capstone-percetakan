/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ------------------------------------------------------------------
        // Design tokens extracted from stitch_web_desain_percetakan_online/
        // (Pastel Studio Boutique + Faeyza Printing pages)
        // ------------------------------------------------------------------
        surface: {
          DEFAULT: '#fcf9f4',
          dim: '#dcdad5',
          bright: '#fcf9f4',
          variant: '#e5e2dd',
          'container-lowest': '#ffffff',
          'container-low': '#f6f3ee',
          container: '#f0ede9',
          'container-high': '#ebe8e3',
          'container-highest': '#e5e2dd',
        },
        paper: '#faf7f2',
        'on-surface': '#1c1c19',
        'on-surface-variant': '#4b4639',
        outline: '#7d7767',
        'outline-variant': '#cec6b4',
        primary: {
          DEFAULT: '#6e5d15',
          container: '#fbe38d',
          fixed: '#fae28c',
          'fixed-dim': '#dcc673',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#75641b',
        secondary: {
          DEFAULT: '#72575e',
          container: '#fed9e1',
          fixed: '#fed9e1',
          'fixed-dim': '#e0bec6',
        },
        'on-secondary': '#ffffff',
        'on-secondary-container': '#795d64',
        'on-secondary-fixed': '#2a161c',
        'on-secondary-fixed-variant': '#594047',
        tertiary: {
          DEFAULT: '#43664e',
          container: '#c6edcf',
          fixed: '#c5ecce',
          'fixed-dim': '#a9d0b3',
        },
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#4a6d54',
        'on-tertiary-fixed-variant': '#2c4e38',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        accent: {
          DEFAULT: '#c2410c',
          dark: '#9a3412',
        },
        butter: '#fbe38d',
        blush: '#fed9e1',
        mint: '#c6edcf',
        sky: '#b2dfee',
        peach: '#f8ba98',
        ink: '#2d2926',
        navy: '#2b3f6c',
      },
      fontFamily: {
        heading: ['Epilogue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-mobile': ['2.125rem', { lineHeight: '2.5rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg-mobile': ['1.625rem', { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['1.5rem', { lineHeight: '1.875rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.625rem', fontWeight: '600' }],
        subheading: ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.75rem', { lineHeight: '1.125rem' }],
        'label-lg': ['0.875rem', { lineHeight: '1.125rem', letterSpacing: '0.04em', fontWeight: '700' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.06em', fontWeight: '700' }],
        'label-caps': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.08em', fontWeight: '800' }],
      },
      borderRadius: {
        card: '1rem',
        panel: '1.5rem',
      },
      boxShadow: {
        // Soft warm paper shadows from the reference elevation scale.
        soft: '0 4px 16px rgba(188, 148, 120, 0.08)',
        card: '0 4px 16px rgba(188, 148, 120, 0.06)',
        lift: '0 8px 24px rgba(160, 120, 100, 0.12), 0 2px 6px rgba(160, 120, 100, 0.04)',
        modal: '0 16px 40px rgba(70, 50, 40, 0.16)',
        // Signature risograph offset shadows.
        hard: '3px 3px 0px #1c1c19',
        'hard-sm': '2px 2px 0px #1c1c19',
        'hard-navy': '4px 4px 0px #2c3539',
        'hard-coral': '4px 4px 0px #c2410c',
        'hard-pink': '4px 4px 0px #fed9e1',
        'hard-butter': '4px 4px 0px #fbe38d',
      },
      spacing: {
        gutter: '1.25rem',
        'gutter-mobile': '0.75rem',
        margin: '2.5rem',
        'margin-mobile': '1rem',
        sidebar: '18rem',
      },
      maxWidth: {
        studio: '1280px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-6px) rotate(-2deg)' },
        },
      },
      animation: {
        marquee: 'marquee 26s linear infinite',
        'fade-up': 'fade-up 300ms ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        'float-soft': 'float-soft 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
