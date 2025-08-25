import { Type as T, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { browser } from '$app/environment';

const ConfigSchema = T.Object({
	VITE_MODE: T.Union([T.Literal('development'), T.Literal('production')]),
	VITE_CLIENT_HOST: T.String(),
	VITE_CLIENT_URL: T.String(),
	VITE_API_BASE_URL: T.String(),
	VITE_API_BASE_URL_SERVER: T.String(),
	VITE_PORT: T.String()
});

type Env = Static<typeof ConfigSchema>;

function createConfig() {
	const rawEnv = import.meta.env;

	if (!Value.Check(ConfigSchema, rawEnv)) {
		const errors = [...Value.Errors(ConfigSchema, rawEnv)]
			.map((err) => `${err.path}: ${err.message}`)
			.join('\n');
		throw new Error(`Environment validation failed:\n${errors}`);
	}

	const env = Value.Clean(ConfigSchema, Value.Decode(ConfigSchema, rawEnv)) as Env;

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
				auth: 'api/auth',
				url: {
					shorten: 'api/url/shorten',
					original: 'api/url/original'
				}
			}
		}
	} as const;
}

export const config = createConfig();
