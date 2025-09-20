export interface ApiResponse<T = unknown> {
	data?: T;
	error?: Error;
	success: boolean;
}

export interface Error {
	message: string;
}

export interface RegisterRequest {
	fullName: string;
	email: string;
	password: string;
}

export interface RegisterResponse {
	id: number;
	fullName: string;
	email: string;
}

export interface LoginRequest {
	email?: string;
	password?: string;
}
export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface AuthStatusResponse {
	user: { id: number; fullName: string; email: string };
	isAuthenticated: boolean;
}

export interface CreateApiKeyRequest {
	name: string;
}

export interface CreateApiKeyResponse {
	id: number;
	key: string;
	name: string;
	lastFour: string;
}

export interface ShortenUrlRequest {
	url: string;
}

export interface ShortenUrlResponse {
	url: string;
}

export interface OriginalUrlRequest {
	url: string;
}

export interface OriginalUrlResponse {
	url: string;
}
