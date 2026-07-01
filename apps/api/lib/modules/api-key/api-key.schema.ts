import { InvalidApiKeyFormat, InvalidApiKeyNameLength } from "./api-key.error";

import z from "zod";

export const API_KEY_LENGTH = 32;
export const ApiKeySchema = z
	.string()
	.trim()
	.length(API_KEY_LENGTH * 2, { error: new InvalidApiKeyFormat().message });

export const ApiKeyNameSchema = z.string().trim().min(4, { error: new InvalidApiKeyNameLength().message });
