function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{html,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        objective: ["Objective", "sans-serif"],
      },
      textColor: {
        skin: {
          base: withOpacity("--color-text-base"),
          muted: withOpacity("--color-text-muted"),
          inverted: withOpacity("--color-text-inverted"),
        },
      },
      backgroundColor: {
        skin: {
          fill: withOpacity("--color-fill"),
          "button-accent": withOpacity("--color-button-accent"),
          "button-accent-hover": withOpacity("--color-button-accent-hover"),
          "button-muted": withOpacity("--color-button-muted"),
        },
      },
      gradientColorStops: {
        skin: {
          hue: withOpacity("--color-fill"),
        },
      },
      colors: {
        textBase: withOpacity("--color-text-base"),
        textMuted: withOpacity("--color-text-muted"),
        textInverted: withOpacity("--color-text-inverted"),
        bgFill: withOpacity("--color-fill"),
        buttonAccent: withOpacity("--color-button-accent"),
        buttonAccentHover: withOpacity("--color-button-accent-hover"),
        buttonMuted: withOpacity("--color-button-muted"),
      },
      gridRow: {
        "span-12": "span 12 / span 12",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/line-clamp")],
}
