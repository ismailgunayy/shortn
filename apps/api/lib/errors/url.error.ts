import { ShortnError } from "./error";

export class UrlError extends ShortnError {
	constructor(message: string, statusCode = 400) {
		super(message, statusCode);
	}
}

export class InvalidUrl extends UrlError {
	constructor() {
		super("Invalid URL", 400);
	}
}

export class InvalidShortenedUrl extends UrlError {
	constructor() {
		super("Invalid Shortened URL", 400);
	}
}
