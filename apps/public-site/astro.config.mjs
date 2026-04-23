import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://mindful.engineer",
	output: "static",
	trailingSlash: "ignore",
	integrations: [mdx()],
	build: {
		format: "file",
	},
	vite: {
		server: {
			host: true,
		},
	},
});
