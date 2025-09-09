import { browser } from '$app/environment';
import z from 'zod';

const ConfigSchema = z.object({
	VITE_MODE: z.enum(['development', 'production']),
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
	} catch (error) {
		console.error('Environment validation failed:', error);
		process.exit(1);
	}
}

function structureConfig() {
	const env = validateEnv();

	// While working locally with docker compose, API base url differs because of the Docker network
	// For example
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
		env,
		api: {
			baseUrl: getApiBaseUrl(),
			endpoints: {
				auth: {
					register: 'auth/register',
					login: 'auth/login',
					refresh: 'auth/refresh',
					logout: 'auth/logout',
					generateApiKey: 'auth/generate-api-key'
				},
				url: {
					shorten: 'url/shorten',
					original: 'url/original'
				}
			}
		}
	} as const;
}

export const config = structureConfig();
