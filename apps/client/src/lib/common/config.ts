import { browser } from "$app/environment";
import z from "zod";

const ConfigSchema = z.object({
	VITE_MODE: z.enum(["development", "production"]),
	VITE_CLIENT_HOST: z.string(),
	VITE_CLIENT_URL: z.string(),
	VITE_API_BASE_URL: z.string(),
	VITE_API_BASE_URL_SERVER: z.string(),
	VITE_PORT: z.string()
});

function validateEnv() {
	try {
		const config = ConfigSchema.parse(import.meta.env);

		return structuredClone(config);
	} catch (err) {
		console.error("Environment validation failed:", err);
		process.exit(1);
	}
}

function structureConfig() {
	const env = validateEnv();

	// While working locally with docker compose, API base url differs because of the Docker network
	// On client side: http://localhost:3124
	// On server side: http://api:3124
	const getApiBaseUrl = () => {
		if (browser) {
			return env.VITE_API_BASE_URL;
		} else {
			return env.VITE_API_BASE_URL_SERVER;
		}
	};

	return {
		HTTP: {
			PORT: Number(env.VITE_PORT),
			CLIENT_HOST: env.VITE_CLIENT_HOST,
			CLIENT_URL: env.VITE_CLIENT_URL,
			API_BASE_URL: getApiBaseUrl()
		},
		MODE: env.VITE_MODE
	};
}

export const config = structureConfig();
