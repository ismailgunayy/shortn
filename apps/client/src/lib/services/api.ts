import type {
	ApiResponse,
	AuthData,
	OriginalUrlResponse,
	ShortenUrlResponse
} from '$lib/types/api';

import { authStore } from '$lib/store/auth';
import { config } from '$lib/common/config';

class ApiService {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit,
		retries: number = 0
	): Promise<ApiResponse<T>> {
		const token = authStore.getAccessToken();
		const url = `${config.api.baseUrl}/${endpoint}`;

		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...(options.headers || {})
		};

		try {
			const fetched = await fetch(url, {
				...options,
				headers
			});

			// Check if authorized 3 times
			if (fetched.status === 401 && retries < 3) {
				await this.authenticate();
				return this.makeRequest(endpoint, options, retries + 1);
			}

			const response = await fetched.json();

			if (response.error) {
				return {
					success: false,
					error: response.error
				};
			}

			return {
				success: true,
				data: response.data
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Network error'
			};
		}
	}

	async authenticate(): Promise<ApiResponse<AuthData>> {
		try {
			const fetched = await fetch(`${config.api.baseUrl}/${config.api.endpoints.auth}`, {
				method: 'GET'
			});
			const response = await fetched.json();

			if (response.error || !response.data) {
				return response;
			}

			const { accessToken, expiresIn } = response.data;

			authStore.update((state) => ({
				...state,
				accessToken,
				expiresIn
			}));

			return response;
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'An error occurred during authentication'
			};
		}
	}

	async shortenUrl(url: string): Promise<ApiResponse<ShortenUrlResponse>> {
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

	async getOriginalUrl(shortenedUrl: string): Promise<ApiResponse<OriginalUrlResponse>> {
		return this.makeRequest<OriginalUrlResponse>(config.api.endpoints.url.original, {
			method: 'POST',
			body: JSON.stringify({ url: shortenedUrl })
		});
	}
}

export const apiService = new ApiService();
