import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { browser } from '$app/environment';

const ConfigSchema = Type.Object({
	VITE_CLIENT_HOST: Type.String(),
	VITE_CLIENT_URL: Type.String(),
	VITE_API_BASE_URL: Type.String(),
	VITE_API_BASE_URL_SERVER: Type.String(),
	VITE_PORT: Type.String()
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
				auth: '/api/auth',
				url: '/api/url'
			}
		}
	} as const;
}

export const config = createConfig();
