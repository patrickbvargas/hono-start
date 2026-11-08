import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

const config = defineConfig({
	server: {
		host: true,
	},
	optimizeDeps: {
		include: [
			"@tanstack/react-form-start > @tanstack/react-form > @tanstack/react-store > use-sync-external-store/shim/with-selector",
		],
	},
	resolve: {
		tsconfigPaths: true,
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		mkcert(),
		devtools(),

		tailwindcss(),
		tanstackStart(),
		nitro(),
		viteReact(),
	],
});

export default config;
