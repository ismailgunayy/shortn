import type {
	ApiResponse,
	LoginRequest,
	LoginResponse,
	OriginalUrlRequest,
	OriginalUrlResponse,
	ShortenUrlRequest,
	ShortenUrlResponse
} from '$lib/types/api';

import { config } from '$lib/common/config';

export class ApiService {
	protected async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
		try {
			const fetched = await fetch(`${config.env.VITE_CLIENT_URL}/api/${endpoint}`, {
				...options,
				headers: {
					...options?.headers,
					'Content-Type': 'application/json'
				}
			});

			return await fetched.json();
		} catch (err) {
			return {
				success: false,
				error: {
					message: err instanceof Error ? err.message : 'Network error'
				}
			};
		}
	}

	async login(values: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		return this.makeRequest<LoginResponse>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(values)
		});
	}

	async shortenUrl({ url }: ShortenUrlRequest): Promise<ApiResponse<ShortenUrlResponse>> {
		if (!url.trim()) {
			throw new Error('Please enter a URL');
		}

		if (config.env.VITE_MODE !== 'development' && !url.match(/^https:\/\/.+\..+/)) {
			throw new Error('Please enter a valid URL (starting with https://)');
		}

		return this.makeRequest<ShortenUrlResponse>(config.api.endpoints.url.shorten, {
			method: 'POST',
			body: JSON.stringify({ url })
		});
	}

	async getOriginalUrl(values: OriginalUrlRequest): Promise<ApiResponse<OriginalUrlResponse>> {
		return this.makeRequest<OriginalUrlResponse>(config.api.endpoints.url.original, {
			method: 'POST',
			body: JSON.stringify(values)
		});
	}
}

export const clientApiService = new ApiService();
