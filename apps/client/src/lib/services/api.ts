import type { ApiResponse, AuthData, OriginalUrlResponse, ShortenUrlResponse } from '$lib/types';

import { config } from '$lib/common/config';

class ApiService {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${config.api.baseUrl}${endpoint}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...((options.headers as Record<string, string>) || {})
		};

		try {
			const response = await fetch(url, {
				...options,
				headers
			});

			const data = await response.json();

			if (!response.ok) {
				return { error: data.error || `HTTP ${response.status}` };
			}

			return { data };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Network error';
			return { error: message };
		}
	}

	async authenticate(): Promise<ApiResponse<AuthData>> {
		return this.makeRequest<AuthData>('/api/auth', { method: 'GET' });
	}

	async shortenUrl(url: string, token: string): Promise<ApiResponse<ShortenUrlResponse>> {
		return this.makeRequest<ShortenUrlResponse>('/api/url/shorten', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ url })
		});
	}

	async getOriginalUrl(shortUrl: string, token: string): Promise<ApiResponse<OriginalUrlResponse>> {
		return this.makeRequest<OriginalUrlResponse>('/api/url/original', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ url: shortUrl })
		});
	}
}

export const apiService = new ApiService();
