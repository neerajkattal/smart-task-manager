/** @type {import('tailwindcss').Config} */

// Colours come from CSS variables (see src/index.css) so one set of class
// names serves both the dark and the light theme.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        panel: token("panel"),
        card: token("card"),
        line: token("line"),
        ink: token("ink"),
        muted: token("muted"),
        faint: token("faint"),
        accent: token("accent"),
        "accent-soft": token("accent-soft"),
        btn: token("btn"),
        "btn-ink": token("btn-ink"),
        high: token("high"),
        medium: token("medium"),
        low: token("low"),
        done: token("done"),
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
