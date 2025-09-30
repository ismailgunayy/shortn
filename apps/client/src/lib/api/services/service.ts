import { browser } from '$app/environment';
import { config } from '$lib/common/config';

export interface ServiceConfig {
	apiKey?: string;
}

export abstract class Service {
	constructor(protected serviceConfig?: ServiceConfig) {}

	// TODO: Implement refresh token logic
	public async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
		try {
			const url = `${config.HTTP.API_BASE_URL}/${endpoint}`;

			const headers: HeadersInit = {
				...(options?.body && { 'Content-Type': 'application/json' }),
				...(!browser &&
					this.serviceConfig?.apiKey && { Authorization: `Bearer ${this.serviceConfig.apiKey}` }),
				...options?.headers
			};

			const fetched = await fetch(url, {
				...options,
				...(browser && { credentials: 'include' }),
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

// Good practice, but I don't have time to implement this now :/
export interface ApiRequest<
	P = Record<string, unknown>,
	Q = Record<string, unknown>,
	B = Record<string, unknown>
> {
	params?: P;
	query?: Q;
	body?: B;
}

export interface ApiResponse<T = unknown> {
	data?: T;
	error?: {
		message: string;
	};
	success: boolean;
}
