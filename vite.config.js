
const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const themePlugin = require("@replit/vite-plugin-shadcn-theme-json");
const path = require("path");
const runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");

module.exports = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [require("@replit/vite-plugin-cartographer").cartographer()]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
