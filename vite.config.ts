import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mars3d from "vite-plugin-mars3d";

export default defineConfig({
  plugins: [vue(), mars3d()],
  server: {
    port: 2888,
  },
});
