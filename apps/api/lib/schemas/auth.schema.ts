import {
	InvalidApiKeyFormat,
	InvalidApiKeyNameLength,
	InvalidEmailFormat,
	InvalidFullNameLength,
	InvalidPasswordLength
} from "~/errors";

import z from "zod";

export const FullNameSchema = z.string().trim().min(2, { error: new InvalidFullNameLength().message });

export const EmailSchema = z.email({ error: new InvalidEmailFormat().message });

export const PasswordSchema = z.string().trim().min(12, { error: new InvalidPasswordLength().message });

export const API_KEY_LENGTH = 32;
export const ApiKeySchema = z
	.string()
	.trim()
	.length(API_KEY_LENGTH * 2, { error: new InvalidApiKeyFormat().message });

export const ApiKeyNameSchema = z.string().trim().min(4, { error: new InvalidApiKeyNameLength().message });
