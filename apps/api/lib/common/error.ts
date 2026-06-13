export class ShortnError extends Error {
	statusCode: number;
	cause?: unknown;

	constructor(message: string, statusCode: number, cause?: unknown) {
		super(message, { cause });
		this.statusCode = statusCode;
	}
}
