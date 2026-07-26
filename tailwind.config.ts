import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F97316",
          hover: "#EA6C0A",
          light: "#FFF7ED",
        },
        brand: {
          green: "#22c55e",
          greenLight: "#f0fdf4",
        },
      },
      backgroundImage: {
        "page-gradient": "linear-gradient(135deg, #e8f5e9 0%, #f0fdf4 40%, #ffffff 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;