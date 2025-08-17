import type { OriginalUrlResponse, ServiceResult, ShortenUrlResponse } from '$lib/types';

import { apiService } from './api';
import { authService } from './auth';

class UrlService {
	private async executeWithAuth<T>(
		apiCall: (token: string) => Promise<{ data?: T; error?: string }>
	): Promise<ServiceResult<T>> {
		let token = authService.getToken();

		if (!token) {
			const authResult = await authService.authenticate();
			if (!authResult.success) {
				return { success: false, error: authResult.error };
			}
			token = authService.getToken();
		}

		if (!token) {
			return { success: false, error: 'Failed to get authentication token' };
		}

		const response = await apiCall(token);

		if (response.error) {
			if (response.error.includes('401') || response.error.includes('Auth error')) {
				authService.clearToken();
				const authResult = await authService.authenticate();
				if (authResult.success) {
					const newToken = authService.getToken();
					if (newToken) {
						const retryResponse = await apiCall(newToken);
						return retryResponse.error
							? { success: false, error: retryResponse.error }
							: { success: true, data: retryResponse.data };
					}
				}
			}
			return { success: false, error: response.error };
		}

		return { success: true, data: response.data };
	}

	async shortenUrl(url: string): Promise<ServiceResult<ShortenUrlResponse>> {
		return this.executeWithAuth((token) => apiService.shortenUrl(url, token));
	}

	async getOriginalUrl(shortUrl: string): Promise<ServiceResult<OriginalUrlResponse>> {
		return this.executeWithAuth((token) => apiService.getOriginalUrl(shortUrl, token));
	}
}

export const urlService = new UrlService();
