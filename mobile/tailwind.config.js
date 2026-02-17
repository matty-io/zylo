/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        background: "#F9FAFB",
        card: "#FFFFFF",
        text: "#111827",
        secondary: "#6B7280",
        success: "#059669",
        error: "#DC2626",
        warning: "#92400E",
      },
    },
  },
  plugins: [],
};
