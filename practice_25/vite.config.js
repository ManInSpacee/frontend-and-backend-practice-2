import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// Vite-конфиг: подключаем React-плагин и анализатор бандла.
// После `npm run build` визуализатор создаст dist/bundle-report.html —
// открой его в браузере, чтобы увидеть размеры всех чанков.
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/bundle-report.html",
      open: false,
      gzipSize: true,
    }),
  ],
  server: { port: 3006 },
});
