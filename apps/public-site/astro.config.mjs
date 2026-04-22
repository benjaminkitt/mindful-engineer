import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mindful.engineer",
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "file",
  },
  vite: {
    server: {
      host: true,
    },
  },
});

