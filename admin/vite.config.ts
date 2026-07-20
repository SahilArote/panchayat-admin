import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";

function copyAdminSubfolderPlugin() {
  return {
    name: "copy-admin-subfolder",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      const adminDir = path.resolve(distDir, "admin");
      if (!fs.existsSync(adminDir)) {
        fs.mkdirSync(adminDir, { recursive: true });
      }
      if (fs.existsSync(path.resolve(distDir, "index.html"))) {
        fs.cpSync(path.resolve(distDir, "index.html"), path.resolve(adminDir, "index.html"));
      }
      if (fs.existsSync(path.resolve(distDir, "vite.svg"))) {
        fs.cpSync(path.resolve(distDir, "vite.svg"), path.resolve(adminDir, "vite.svg"));
      }
      if (fs.existsSync(path.resolve(distDir, "assets"))) {
        fs.cpSync(path.resolve(distDir, "assets"), path.resolve(adminDir, "assets"), { recursive: true });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || "/admin/",
  plugins: [react(), svgr(), tailwindcss(), copyAdminSubfolderPlugin()],
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
    },
  },
});
