import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const config = defineConfig({
	optimizeDeps: {
		include: [
			"@tanstack/react-form-start > @tanstack/react-form > @tanstack/react-store > use-sync-external-store/shim/with-selector",
		],
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		devtools(),
		viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		nitro(),
		viteReact(),
	],
	test: {
		pool: "forks",
		minWorkers: 1,
		maxWorkers: 2,
	},
});

export default config;
