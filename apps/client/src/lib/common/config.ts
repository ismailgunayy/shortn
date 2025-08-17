import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const ConfigSchema = Type.Object({
	VITE_API_BASE_URL: Type.String({
		pattern: '^https?://.+'
	}),
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

	return {
		env,
		api: {
			baseUrl: env.VITE_API_BASE_URL,
			endpoints: {
				auth: '/api/auth',
				url: '/api/url'
			}
		}
	} as const;
}

export const config = createConfig();
export const env = config.env;
