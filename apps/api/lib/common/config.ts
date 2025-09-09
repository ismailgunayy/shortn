import { config } from "dotenv";
import z from "zod";

config();

const EnvSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]),
	APP_ENV: z.enum(["local", "production"]),
	HOST: z.string(),
	BASE_URL: z.url(),
	CLIENT_URL: z.url(),
	PORT: z.number(),
	COOKIE_SECRET: z.string().length(32),
	JWT_SECRET: z.string().length(32),
	JWT_ACCESS_EXPIRES_IN_SECONDS: z.number(),
	JWT_REFRESH_EXPIRES_IN_SECONDS: z.number(),
	DATABASE_URL: z.url(),
	REDIS_URL: z.url()
});

// Special treatment for numbers
function convertNumbers(schema: typeof EnvSchema, env: NodeJS.ProcessEnv) {
	const result: Record<string, string | number | undefined> = structuredClone(env);

	for (const [key, { type }] of Object.entries(schema.shape)) {
		if (type === "number") {
			result[key] = Number(env[key]);
		}
	}

	return result;
}

function validateEnv() {
	try {
		const processedEnv = convertNumbers(EnvSchema, process.env);
		const config = EnvSchema.parse(processedEnv);

		return structuredClone(config);
	} catch (error) {
		console.error("Environment validation failed:", error);
		process.exit(1);
	}
}

function structureConfig() {
	const env = validateEnv();

	return {
		HTTP: {
			HOST: env.HOST,
			PORT: env.PORT,
			BASE_URL: env.BASE_URL,
			CLIENT_URL: env.CLIENT_URL
		},
		AUTH: {
			COOKIE_SECRET: env.COOKIE_SECRET,
			JWT: {
				SECRET: env.JWT_SECRET,
				ACCESS_EXPIRES_IN_SECONDS: env.JWT_ACCESS_EXPIRES_IN_SECONDS,
				REFRESH_EXPIRES_IN_SECONDS: env.JWT_REFRESH_EXPIRES_IN_SECONDS
			}
		},
		DATABASE: {
			URL: env.DATABASE_URL
		},
		REDIS: {
			URL: env.REDIS_URL
		},
		IS_LOCAL: env.APP_ENV === "local",
		IS_PRODUCTION: env.APP_ENV === "production"
	};
}

export type TConfig = ReturnType<typeof structureConfig>;
export const APP_CONFIG = structureConfig();
