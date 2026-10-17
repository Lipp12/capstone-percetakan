/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aksen tunggal untuk seluruh aplikasi (crimson / brand percetakan).
        // Dipakai lewat kelas `brand-*` supaya tidak ada warna mentah yang
        // bocor di component.
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        // Netral aplikasi. Memakai `slate` sebagai satu-satunya abu-abu
        // supaya sidebar dan halaman memakai bahasa warna yang sama.
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        "theme-xs": ["0.75rem", { lineHeight: "1rem" }],
        "theme-sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "theme-xl": ["1.25rem", { lineHeight: "1.75rem" }],
        "title-sm": ["1.5rem", { lineHeight: "2rem" }],
        "title-md": ["1.875rem", { lineHeight: "2.25rem" }],
        "title-lg": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "theme-xs": "0 1px 2px 0 rgb(15 23 42 / 0.04)",
        "theme-sm": "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
        "theme-md": "0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 6px -2px rgb(15 23 42 / 0.05)",
        "theme-lg": "0 12px 24px -6px rgb(15 23 42 / 0.10)",
        "focus-ring": "0 0 0 3px rgb(244 63 94 / 0.25)",
      },
      spacing: {
        sidebar: "18.125rem", // 290px - sidebar expanded
        "sidebar-collapsed": "5.625rem", // 90px - sidebar collapsed
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};