import { defineConfig, loadEnv, type ServerOptions } from "vite";

import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
	const cwd = process.cwd();
	const env = { ...loadEnv(mode, cwd, "VITE_") };

	const options: ServerOptions = {
		host: true,
		port: Number(env.VITE_PORT) || 3024,
		strictPort: true
	};

	return {
		plugins: [tailwindcss(), sveltekit()],
		preview: {
			...options,
			allowedHosts: ["." + env.VITE_CLIENT_HOST]
		},
		server: options
	};
});
