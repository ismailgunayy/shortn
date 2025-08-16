import { Static, Type as T } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { config } from "dotenv";

config();

const ConfigSchema = T.Object({
	NODE_ENV: T.Union([T.Literal("development"), T.Literal("production"), T.Literal("test")], { default: "development" }),
	PORT: T.String({ default: "8023" }),
	JWT_SECRET: T.String({ minLength: 32 })
});

export type TConfig = Static<typeof ConfigSchema>;

function validateEnv(): TConfig {
	try {
		const decodedEnv = Value.Decode(ConfigSchema, process.env);
		return Value.Clean(ConfigSchema, decodedEnv) as TConfig;
	} catch (error) {
		console.error("Environment validation failed:", error);
		process.exit(1);
	}
}

export const Config = validateEnv();
