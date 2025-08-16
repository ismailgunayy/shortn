import { Static, Type as T } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { config } from "dotenv";

config();

const ConfigSchema = T.Object({
	NODE_ENV: T.Union([T.Literal("development"), T.Literal("production"), T.Literal("test")]),
	PORT: T.String(),
	JWT_SECRET: T.String({ minLength: 32, maxLength: 32 }),
	JWT_EXPIRES_IN: T.RegExp(/^\d+(s|m|h|d)$/) // 1s, 1m, 1h, 1d
});

export type TConfig = Readonly<Static<typeof ConfigSchema>>;

function validateEnv(): TConfig {
	try {
		const decodedEnv = Value.Decode(ConfigSchema, process.env);
		const cleaned = Value.Clean(ConfigSchema, decodedEnv) as TConfig;

		const config = { ...cleaned };
		return Object.freeze(config);
	} catch (error) {
		console.error("Environment validation failed:", error);
		process.exit(1);
	}
}

export const Config = validateEnv();
