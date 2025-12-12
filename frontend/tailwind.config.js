module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%": { transform: "translateY(0px)", opacity: "0.5" },
          "50%": { transform: "translateY(-10px)", opacity: "1" },
          "100%": { transform: "translateY(0px)", opacity: "0.5" },
        },
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
