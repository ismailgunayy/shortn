import type { ApiResponse } from '$lib/types/api.types';
import { browser } from '$app/environment';
import { config } from '$lib/common/config';
import { cookieStore } from '$lib/stores/cookies.store';

export interface ServiceConfig {
	apiKey?: string;
}

export abstract class Service {
	constructor(protected apiKey?: ServiceConfig) {}

	// TODO: Implement refresh token logic
	public async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
		try {
			const url = `${config.api.baseUrl}/api/${endpoint}`;

			const headers: HeadersInit = {
				...(options?.body && { 'Content-Type': 'application/json' }),
				...(!browser && this.apiKey?.apiKey && { Authorization: `Bearer ${this.apiKey.apiKey}` }),
				...(!browser && { Cookie: cookieStore.getCookieString() }),
				...options?.headers
			};

			const fetched = await fetch(url, {
				...options,
				credentials: 'include',
				headers
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
}
