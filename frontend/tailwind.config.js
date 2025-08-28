import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f4f4f7",
        secondary: "#222529",
        tertiary: "#222529",
        // ⚠️ لا تستخدم هذه الثوابت بشكل مباشر في النصوص، استخدم base-content بدلاً
        gray: {
          10: "#EEEEEE",
          20: "#A2A2A2",
          30: "#7B7B7B",
          50: "#585858",
          90: "#141414",
        },
      },
      screens: {
        xs: "400px",
        "3xl": "1680px",
        "4xl": "2200px",
      },
      backgroundImage: {
        hero: "url(/src/assets/bg.png)",
        banner: "url(/src/assets/banner.png)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#222529",
          "primary-content": "#ffffff",
          secondary: "#f4f4f7",
          "secondary-content": "#141414",
          accent: "#7B7B7B",
          neutral: "#585858",
          "base-100": "#ffffff",
          "base-content": "#141414",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
      "light",
      "dark",
      "dracula",
      "luxury",
      "night",
      "cyberpunk",
      "synthwave",
      "forest",
    ],
  },
  variants: {
  extend: {
    display: ['print'],
  },
},

};
