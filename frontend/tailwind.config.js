/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8fb",
          100: "#d4ecf4",
          500: "#31839c",
          700: "#245e72",
          900: "#183a46"
        },
        sand: "#f4efe4",
        coral: "#e78963"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(21, 37, 56, 0.08)"
      }
    }
  },
  plugins: []
};
