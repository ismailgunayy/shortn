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
