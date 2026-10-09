/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-subtle': 'var(--accent-subtle)',
        success: 'var(--success)',
        'success-subtle': 'var(--success-subtle)',
        warning: 'var(--warning)',
        'warning-subtle': 'var(--warning-subtle)',
        danger: 'var(--danger)',
        'danger-subtle': 'var(--danger-subtle)',
        info: 'var(--info)',
        'info-subtle': 'var(--info-subtle)',
        maroon: {
          frame: 'var(--maroon-frame)',
          brand: 'var(--maroon-brand)',
          night: 'var(--maroon-night)',
          card: 'var(--maroon-card)',
          cream: 'var(--maroon-cream)',
          glow: 'var(--maroon-glow)',
        },
      },
      boxShadow: {
        premium: 'var(--card-shadow)',
        'premium-hover': 'var(--card-shadow-hover)',
      },
    },
  },
  plugins: [],
};
