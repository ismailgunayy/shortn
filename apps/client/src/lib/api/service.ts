import type { ApiResponse } from '$lib/types/api';
import { browser } from '$app/environment';
import { config } from '$lib/common/config';
import { cookieStore } from '$lib/stores/cookies.store';

export class Service {
	public async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
		try {
			const url = `${config.api.baseUrl}/api/${endpoint}`;

			const headers = {
				'Content-Type': 'application/json',
				// TODO: Update here when the shit is fixed in the API
				'x-service': config.env.VITE_CLIENT_URL,
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
