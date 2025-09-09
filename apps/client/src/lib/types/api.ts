export interface ApiResponse<T = unknown> {
	data?: T;
	error?: Error;
	success: boolean;
}

export interface Error {
	message: string;
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
