type Nullable<T> = {
	[K in keyof T]: T[K] | null;
};

export interface ApiResponse<T = unknown> {
	data?: T;
	error?: string;
	success: boolean;
}

export interface AuthData {
	accessToken: string;
	expiresIn: string;
}

export type AuthState = Nullable<AuthData>;

export interface ShortenUrlResponse {
	url: string;
}

export interface OriginalUrlResponse {
	url: string;
}
