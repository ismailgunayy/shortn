import { APP_CONFIG } from "~/common/config";
import { ShortnError } from "./base.error";

export class UrlError extends ShortnError {
	constructor(message: string, statusCode = 400, cause?: unknown) {
		super(message, statusCode, cause);
	}
}

export class InvalidUrl extends UrlError {
	constructor(cause?: unknown) {
		super("Invalid URL", 400, cause);
	}
}

export class InvalidShortenedUrl extends UrlError {
	constructor(cause?: unknown) {
		super("Invalid Shortened URL", 400, cause);
	}
}

export class CustomCodeAlreadyInUse extends UrlError {
	constructor(cause?: unknown) {
		super("Custom code already in use", 409, cause);
	}
}

export class UrlNotFound extends UrlError {
	constructor(cause?: unknown) {
		super("URL not found", 404, cause);
	}
}

export class CustomUrlNotFound extends UrlError {
	constructor(cause?: unknown) {
		super("Custom URL not found", 404, cause);
	}
}

export class InvalidUrlProtocol extends UrlError {
	constructor(cause?: unknown) {
		super("URL must use HTTPS protocol", 400, cause);
	}
}

export class InvalidShortenedUrlDomain extends UrlError {
	constructor(cause?: unknown) {
		super(`URL must be a valid shortened URL from ${APP_CONFIG.HTTP.CLIENT_URL}`, 400, cause);
	}
}

export class InvalidCustomCode extends UrlError {
	constructor(cause?: unknown) {
		super("Custom code can only contain letters, numbers, underscores, and hyphens.", 400, cause);
	}
}

export class CannotCreateCustomUrlWithServiceAccount extends UrlError {
	constructor(cause?: unknown) {
		super("Custom URLs cannot be created without authentication.", 403, cause);
	}
}
