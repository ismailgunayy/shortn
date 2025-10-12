import { ShortnError } from "./base.error";

export class AuthError extends ShortnError {
	constructor(message: string, statusCode = 401, cause?: unknown) {
		super(message, statusCode, cause);
	}
}

export class InvalidCookieSignature extends AuthError {
	constructor(cause?: unknown) {
		super("Invalid cookie signature", 400, cause);
	}
}

export class InvalidTokenType extends AuthError {
	constructor(cause?: unknown) {
		super("Invalid token type", 400, cause);
	}
}

export class InvalidOrExpiredToken extends AuthError {
	constructor(cause?: unknown) {
		super("Invalid or expired token", 401, cause);
	}
}

export class AccessTokenNotFound extends AuthError {
	constructor(cause?: unknown) {
		super("Access token not found", 404, cause);
	}
}

export class RefreshTokenNotFound extends AuthError {
	constructor(cause?: unknown) {
		super("Refresh token not found", 404, cause);
	}
}

export class ApiKeyNameAlreadyInUse extends AuthError {
	constructor(cause?: unknown) {
		super("API key name already in use", 409, cause);
	}
}

export class InvalidApiKey extends AuthError {
	constructor(cause?: unknown) {
		super("Invalid API key", 400, cause);
	}
}

export class InactiveApiKey extends AuthError {
	constructor(cause?: unknown) {
		super("Inactive API key", 403, cause);
	}
}

export class InvalidApiKeyFormat extends AuthError {
	constructor(cause?: unknown) {
		super("Invalid API key format", 400, cause);
	}
}

export class InvalidApiKeyNameLength extends AuthError {
	constructor(cause?: unknown) {
		super("API Key name must be at least 4 characters long", 400, cause);
	}
}

export class ApiKeyNotFound extends AuthError {
	constructor(cause?: unknown) {
		super("API key not found", 404, cause);
	}
}

export class ApiKeyNotProvided extends AuthError {
	constructor(cause?: unknown) {
		super("API key not provided", 400, cause);
	}
}

export class Unauthorized extends AuthError {
	constructor(cause?: unknown) {
		super("Unauthorized", 401, cause);
	}
}

export class UserNotFound extends AuthError {
	constructor(cause?: unknown) {
		super("User not found", 404, cause);
	}
}

export class UserAlreadyExists extends AuthError {
	constructor(cause?: unknown) {
		super("User already exists", 409, cause);
	}
}

export class WrongPassword extends AuthError {
	constructor(cause?: unknown) {
		super("Wrong password", 401, cause);
	}
}

export class InvalidEmailFormat extends AuthError {
	constructor(cause?: unknown) {
		super("Invalid email format", 400, cause);
	}
}

export class InvalidPasswordLength extends AuthError {
	constructor(cause?: unknown) {
		super("Password must be at least 12 characters long", 400, cause);
	}
}

export class InvalidFullNameLength extends AuthError {
	constructor(cause?: unknown) {
		super("Full name must be at least 2 characters long", 400, cause);
	}
}
