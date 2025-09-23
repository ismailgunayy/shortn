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
	customCode?: string;
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

export interface UrlItem {
	id: number;
	originalUrl: string;
	shortenedUrl: string;
	shortCode: string;
	createdAt: string;
}

export interface CustomUrlItem {
	id: number;
	originalUrl: string;
	shortenedUrl: string;
	customCode: string;
	createdAt: string;
}

export interface GetUrlsResponse {
	urls: UrlItem[];
	customUrls: CustomUrlItem[];
}

export interface DeleteUrlRequest {
	shortenedUrl: string;
}

export interface ApiKeyItem {
	id: number;
	name: string;
	lastFour: string;
	createdAt: string;
	lastUsedAt: string;
}

export interface GetApiKeysResponse {
	apiKeys: ApiKeyItem[];
}

export interface UpdateApiKeyRequest {
	name: string;
}

export interface UpdateApiKeyResponse {
	id: number;
	name: string;
	lastFour: string;
}
