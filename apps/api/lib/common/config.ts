import { config } from "dotenv";
import z from "zod";

config();

const EnvSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]),
	APP_ENV: z.enum(["local", "production"]),
	HOST: z.string(),
	BASE_URL: z.url(),
	CLIENT_URL: z.url(),
	DOCS_URL: z.url(),
	ALLOWED_ORIGINS: z
		.string()
		.default("")
		.transform((val) =>
			val
				.split(",")
				.map((origin) => origin.trim())
				.filter((origin) => origin.length > 0)
		),
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
	} catch (err) {
		console.error("Environment validation failed:", err);
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
			CLIENT_URL: env.CLIENT_URL,
			DOCS_URL: env.DOCS_URL,
			ALLOWED_ORIGINS: env.ALLOWED_ORIGINS
		},
		AUTH: {
			COOKIE_SECRET: env.COOKIE_SECRET,
			JWT: {
				SECRET: env.JWT_SECRET,
				ACCESS_EXPIRES_IN_SECONDS: env.JWT_ACCESS_EXPIRES_IN_SECONDS,
				REFRESH_EXPIRES_IN_SECONDS: env.JWT_REFRESH_EXPIRES_IN_SECONDS
			},
			SERVICE_ACCOUNT_EMAIL:
				env.APP_ENV === "local"
					? `service-account@${new URL(env.BASE_URL).hostname}.com`
					: `service-account@${new URL(env.BASE_URL).hostname}`
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
export const APP_CONFIG = Object.freeze(structureConfig());
