import { defineConfig, loadEnv } from 'vite';

import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
	const cwd = process.cwd();
	const env = { ...loadEnv(mode, cwd, 'VITE_') };

	const options = {
		host: true,
		port: Number(env.VITE_PORT) || 3023,
		strictPort: true
	};

	return {
		plugins: [tailwindcss(), sveltekit()],
		preview: options,
		server: options
	};
});
