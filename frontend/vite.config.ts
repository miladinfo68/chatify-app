import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  build:{manifest:true ,outDir:"./dist"},
  base:"./",
  root:"./dist",
  plugins: [react(), tailwindcss()],
});
