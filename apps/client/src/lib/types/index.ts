export interface ApiResponse<T = unknown> {
	data?: T;
	error?: string;
}

export interface ServiceResult<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
}

export interface AuthData {
	accessToken: string;
	expiresIn: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	token: string | null;
	expiresIn: string | null;
	isLoading: boolean;
}

export interface ShortenUrlResponse {
	url: string;
}

export interface OriginalUrlResponse {
	url: string;
}
