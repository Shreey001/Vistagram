/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "spin-slower": "spin 5s linear infinite",
        gradient: "gradient 3s ease infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "h1, h2, h3, h4": {
              color: theme("colors.pink.400"),
            },
            "p, li, ul, ol": {
              color: theme("colors.gray.300"),
            },
            blockquote: {
              color: theme("colors.gray.400"),
              borderLeftColor: theme("colors.purple.600"),
            },
            a: {
              color: theme("colors.purple.400"),
              "&:hover": {
                color: theme("colors.purple.300"),
              },
            },
            code: {
              color: theme("colors.pink.400"),
              backgroundColor: theme("colors.gray.800"),
              padding: theme("spacing.1"),
              borderRadius: theme("borderRadius.md"),
              fontWeight: "500",
            },
            pre: {
              backgroundColor: theme("colors.gray.900"),
              color: theme("colors.gray.300"),
              border: `1px solid ${theme("colors.gray.800")}`,
              borderRadius: theme("borderRadius.lg"),
            },
            hr: {
              borderColor: theme("colors.gray.800"),
            },
            strong: {
              color: theme("colors.white"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
