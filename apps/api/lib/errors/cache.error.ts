import { ShortnError } from "./base.error";

export class CacheError extends ShortnError {
	constructor(message: string, statusCode = 400, cause?: unknown) {
		super(message, statusCode, cause);
	}
}

export class CacheConnectionError extends CacheError {
	constructor(cause?: unknown) {
		super("Unable to connect to cache", 500, cause);
	}
}

export class CacheServiceError extends CacheError {
	constructor(cause?: unknown) {
		super("Cache service error", 500, cause);
	}
}
