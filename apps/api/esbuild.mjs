import esbuild from "esbuild";

esbuild
	.build({
		bundle: true,
		entryPoints: ["lib/app.ts"],
		external: ["fastify", "@fastify/*"],
		format: "esm",
		minify: true,
		outfile: "dist/app.js",
		packages: "external",
		platform: "node",
		target: ["es2022"]
	})
	.catch(() => {
		console.error("Build failed");
		process.exit(1);
	});
