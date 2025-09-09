import { ShortnError } from "./error";

export class AuthError extends ShortnError {
	constructor(message: string, statusCode = 401) {
		super(message, statusCode);
	}
}

export class InvalidCookieSignature extends AuthError {
	constructor() {
		super("Invalid cookie signature", 400);
	}
}

export class InvalidTokenType extends AuthError {
	constructor() {
		super("Invalid token type", 400);
	}
}

export class InvalidOrExpiredToken extends AuthError {
	constructor() {
		super("Invalid or expired token", 401);
	}
}

export class AccessTokenNotFound extends AuthError {
	constructor() {
		super("Access token not found", 404);
	}
}

export class RefreshTokenNotFound extends AuthError {
	constructor() {
		super("Refresh token not found", 404);
	}
}

export class InvalidApiKey extends AuthError {
	constructor() {
		super("Invalid API key", 400);
	}
}

export class InactiveApiKey extends AuthError {
	constructor() {
		super("Inactive API key", 403);
	}
}

export class InvalidApiKeyFormat extends AuthError {
	constructor() {
		super("Invalid API key format", 400);
	}
}

export class ApiKeyNotFound extends AuthError {
	constructor() {
		super("API key not found", 404);
	}
}

export class ApiKeyNotProvided extends AuthError {
	constructor() {
		super("API key not provided", 400);
	}
}

export class Unauthorized extends AuthError {
	constructor() {
		super("Unauthorized", 401);
	}
}

export class UserNotFound extends AuthError {
	constructor() {
		super("User not found", 404);
	}
}

export class UserAlreadyExists extends AuthError {
	constructor() {
		super("User already exists", 409);
	}
}

export class WrongPassword extends AuthError {
	constructor() {
		super("Wrong password", 401);
	}
}

export class InvalidEmailFormat extends AuthError {
	constructor() {
		super("Invalid email format", 400);
	}
}

export class InvalidPasswordFormat extends AuthError {
	constructor() {
		super("Invalid password format", 400);
	}
}
