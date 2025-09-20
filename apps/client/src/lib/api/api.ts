import type { ApiResponse } from '$lib/types/api';
import { config } from '$lib/common/config';

export enum API_CONTEXT {
	Client = 'client',
	Server = 'server'
}

export class API {
	private readonly context: API_CONTEXT;
	private readonly apiKey?: string;

	constructor(context: API_CONTEXT) {
		this.context = context;

		if (context === 'server') {
			this.apiKey = import.meta.env.VITE_API_KEY;

			if (!this.apiKey) {
				console.error('API key is missing. Please set VITE_API_KEY in your environment variables.');
				process.exit(1);
			}
		}
	}

	public async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
		try {
			const baseUrl = this.getBaseUrl();
			const url = `${baseUrl}/api/${endpoint}`;

			const headers = this.buildHeaders(options?.headers);

			const fetched = await fetch(url, {
				...options,
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

	private getBaseUrl(): string {
		if (this.context === 'client') {
			return config.env.VITE_CLIENT_URL;
		} else {
			return config.api.baseUrl;
		}
	}

	private buildHeaders(existingHeaders?: HeadersInit): HeadersInit {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...existingHeaders
		};

		if (this.context === 'server' && this.apiKey) {
			(headers as Record<string, string>).Authorization = `Bearer ${this.apiKey}`;
		}

		return headers;
	}
}
