import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          primary: "#4B2E83",
          light: "#EDE9FE",
          accent: "#7C3AED",
          ink: "#22163E",
          cream: "#FAF8FF",
        },
      },
    },
  },
  plugins: [],
};

export default config;
