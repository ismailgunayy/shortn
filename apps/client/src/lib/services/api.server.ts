import type { ApiResponse } from '$lib/types/api';
import { ApiService } from './api';
import { config } from '$lib/common/config';

class ServerApiService extends ApiService {
	private readonly apiKey: string;

	constructor() {
		super();

		const apiKey = import.meta.env.VITE_API_KEY;

		if (!apiKey) {
			console.error('API key is missing. Please set VITE_API_KEY in your environment variables.');
			process.exit(1);
		}

		this.apiKey = apiKey;
	}

	protected async makeRequest<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
		try {
			const url = `${config.api.baseUrl}/api/${endpoint}`;

			const fetched = await fetch(url, {
				...options,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiKey}`
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
}

export const serverApiService = new ServerApiService();
