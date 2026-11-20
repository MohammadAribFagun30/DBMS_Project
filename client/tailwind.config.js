/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          alt: 'var(--surface-alt)',
        },
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          contrast: 'var(--primary-contrast)',
        },
        highlight: 'var(--highlight)',
        status: {
          approved: {
            text: 'var(--status-approved-text)',
            bg: 'var(--status-approved-bg)',
          },
          pending: {
            text: 'var(--status-pending-text)',
            bg: 'var(--status-pending-bg)',
          },
          rejected: {
            text: 'var(--status-rejected-text)',
            bg: 'var(--status-rejected-bg)',
          },
          attended: {
            text: 'var(--status-attended-text)',
            bg: 'var(--status-attended-bg)',
          },
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', '"Hind Siliguri"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '6px',
        xl: '6px',
        '2xl': '6px',
        '3xl': '6px',
        full: '6px', // Max 6px everywhere per guidelines
      },
      boxShadow: {
        none: 'none',
        xs: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
      },
    },
  },
  plugins: [],
}
