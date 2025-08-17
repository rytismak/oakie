import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/oakie/",
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
});
