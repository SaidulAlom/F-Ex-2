import type { Config } from 'tailwindcss';

/**
 * F-Ex Store — Luxury Maximalism design system.
 * Every colour below is a token in app/globals.css and can be retuned there.
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1.25rem', lg: '2rem' }, screens: { '2xl': '1440px' } },
    extend: {
      colors: {
        // ---- brand tokens (exact hexes from the brief) ----
        ink: '#0F3040',        // Deep Teal Navy — primary background
        'ink-deep': '#081C27', // deepest shadows
        plum: '#464858',       // Slate Plum — surfaces / glass / borders on dark
        rose: '#A56F63',       // Dusty Rose — large text (24px+), icons, decoration
        peach: '#D99B7F',      // Warm Peach — CTAs, links, glows, foil
        cream: '#F6EBE3',      // light sections + body text on dark
        // semantic aliases used by shadcn primitives (admin panel)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bodoni Moda', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Sora', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        display: ['clamp(3rem, 12vw, 15rem)', { lineHeight: '0.84', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(2.25rem, 8vw, 7rem)', { lineHeight: '0.88', letterSpacing: '-0.02em' }],
      },
      backgroundImage: {
        'teal-plum': 'linear-gradient(150deg, #0F3040 0%, #0F3040 38%, #464858 100%)',
        'foil': 'linear-gradient(100deg, #A56F63 0%, #D99B7F 38%, #F6EBE3 52%, #D99B7F 66%, #A56F63 100%)',
        'foil-soft': 'linear-gradient(135deg, #A56F63 0%, #D99B7F 100%)',
        'spotlight': 'radial-gradient(circle at 50% 35%, rgba(217,155,127,0.30) 0%, rgba(217,155,127,0.07) 32%, transparent 66%)',
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'peach-glow': '0 0 0 1px rgba(217,155,127,0.28), 0 18px 60px -18px rgba(217,155,127,0.45)',
        'card-lift': '0 40px 80px -40px rgba(8,28,39,0.85)',
        inset: 'inset 0 1px 0 rgba(246,235,227,0.10)',
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      transitionTimingFunction: { luxe: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        marquee: { from: { transform: 'translate3d(0,0,0)' }, to: { transform: 'translate3d(-50%,0,0)' } },
        shimmer: { '0%': { backgroundPosition: '200% 50%' }, '100%': { backgroundPosition: '-60% 50%' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'pulse-peach': {
          '0%,100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.35)' },
        },
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 38s) linear infinite',
        'marquee-reverse': 'marquee var(--marquee-duration, 38s) linear infinite reverse',
        shimmer: 'shimmer 6s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        'pulse-peach': 'pulse-peach 2.4s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
