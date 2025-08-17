export class InvalidURL extends Error {
	constructor() {
		super("Invalid URL");
	}
}

export class InvalidShortenedURL extends Error {
	constructor() {
		super("Invalid Shortened URL");
	}
}
