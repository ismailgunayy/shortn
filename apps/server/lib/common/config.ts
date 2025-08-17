import { Static, Type as T } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { config } from "dotenv";

config();

const ConfigSchema = T.Object({
	NODE_ENV: T.Union([T.Literal("development"), T.Literal("production"), T.Literal("test")]),
	PORT: T.String(),
	JWT_SECRET: T.String({ minLength: 32, maxLength: 32 }),
	JWT_EXPIRES_IN: T.RegExp(/^\d+(s|m|h|d)$/), // 1s, 1m, 1h, 1d
	POSTGRES_DB: T.String(),
	POSTGRES_HOST: T.String(),
	POSTGRES_USER: T.String(),
	POSTGRES_PASSWORD: T.String(),
	POSTGRES_PORT: T.String(),
	DATABASE_URL: T.String()
});

function validateEnv() {
	try {
		const decodedEnv = Value.Decode(ConfigSchema, process.env);
		const cleaned = Value.Clean(ConfigSchema, decodedEnv) as Static<typeof ConfigSchema>;

		const config = {
			NODE_ENV: cleaned.NODE_ENV,
			PORT: cleaned.PORT,
			auth: {
				JWT_SECRET: cleaned.JWT_SECRET,
				JWT_EXPIRES_IN: cleaned.JWT_EXPIRES_IN
			},
			db: {
				POSTGRES_DB: cleaned.POSTGRES_DB,
				POSTGRES_HOST: cleaned.POSTGRES_HOST,
				POSTGRES_USER: cleaned.POSTGRES_USER,
				POSTGRES_PASSWORD: cleaned.POSTGRES_PASSWORD,
				POSTGRES_PORT: cleaned.POSTGRES_PORT,
				DATABASE_URL: cleaned.DATABASE_URL
			}
		};
		return Object.freeze(config);
	} catch (error) {
		console.error("Environment validation failed:", error);
		process.exit(1);
	}
}

export type TConfig = ReturnType<typeof validateEnv>;
export const Config = validateEnv();
