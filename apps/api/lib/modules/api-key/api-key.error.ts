import { ShortnError } from "~/common/error";

export class ApiKeyError extends ShortnError {
	constructor(message: string, statusCode = 401, cause?: unknown) {
		super(message, statusCode, cause);
	}
}

export class ApiKeyNameAlreadyInUse extends ApiKeyError {
	constructor(cause?: unknown) {
		super("API key name already in use", 409, cause);
	}
}

export class InactiveApiKey extends ApiKeyError {
	constructor(cause?: unknown) {
		super("Inactive API key", 403, cause);
	}
}

export class InvalidApiKeyFormat extends ApiKeyError {
	constructor(cause?: unknown) {
		super("Invalid API key format", 400, cause);
	}
}

export class InvalidApiKeyNameLength extends ApiKeyError {
	constructor(cause?: unknown) {
		super("API Key name must be at least 4 characters long", 400, cause);
	}
}

export class ApiKeyNotFound extends ApiKeyError {
	constructor(cause?: unknown) {
		super("API key not found", 401, cause);
	}
}

export class ApiKeyNotProvided extends ApiKeyError {
	constructor(cause?: unknown) {
		super("API key not provided", 400, cause);
	}
}

export class ApiKeyCreationLimitReached extends ApiKeyError {
	constructor(count: number, cause?: unknown) {
		super(`Maximum number of ${count} API keys reached`, 403, cause);
	}
}
