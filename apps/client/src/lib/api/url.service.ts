import type {
	ApiResponse,
	OriginalUrlRequest,
	OriginalUrlResponse,
	ShortenUrlRequest,
	ShortenUrlResponse
} from '$lib/types/api';

import { Service } from './service';
import { config } from '$lib/common/config';

export class UrlService extends Service {
	constructor() {
		super();
	}

	public async shorten({ url }: ShortenUrlRequest): Promise<ApiResponse<ShortenUrlResponse>> {
		if (!url.trim()) {
			throw new Error('Please enter a URL');
		}

		if (config.env.VITE_MODE !== 'development' && !url.match(/^https:\/\/.+\..+/)) {
			throw new Error('Please enter a valid URL (starting with https://)');
		}

		return await this.request<ShortenUrlResponse>(config.api.endpoints.url.shorten, {
			method: 'POST',
			body: JSON.stringify({ url })
		});
	}

	public async getOriginal(values: OriginalUrlRequest): Promise<ApiResponse<OriginalUrlResponse>> {
		return await this.request<OriginalUrlResponse>(config.api.endpoints.url.original, {
			method: 'POST',
			body: JSON.stringify(values)
		});
	}
}
