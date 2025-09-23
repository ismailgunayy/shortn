import type {
	ApiResponse,
	DeleteUrlRequest,
	GetUrlsResponse,
	OriginalUrlRequest,
	OriginalUrlResponse,
	ShortenUrlRequest,
	ShortenUrlResponse
} from '$lib/types/api.types';

import { Service, type ServiceConfig } from './service';
import { config } from '$lib/common/config';

export class UrlService extends Service {
	constructor(config?: ServiceConfig) {
		super(config);
	}

	public async shorten(values: ShortenUrlRequest): Promise<ApiResponse<ShortenUrlResponse>> {
		if (!values.url.trim()) {
			throw new Error('Please enter a URL');
		}

		if (config.env.VITE_MODE !== 'development' && !values.url.match(/^https:\/\/.+\..+/)) {
			throw new Error('Please enter a valid URL (starting with https://)');
		}

		const body: ShortenUrlRequest = { url: values.url };
		if (values.customCode?.trim()) {
			body.customCode = values.customCode.trim();
		}

		return await this.request<ShortenUrlResponse>(config.api.endpoints.url.shorten, {
			method: 'POST',
			body: JSON.stringify(body)
		});
	}

	public async getOriginal(values: OriginalUrlRequest): Promise<ApiResponse<OriginalUrlResponse>> {
		return await this.request<OriginalUrlResponse>(config.api.endpoints.url.original, {
			method: 'POST',
			body: JSON.stringify(values)
		});
	}

	public async getUserUrls(): Promise<ApiResponse<GetUrlsResponse>> {
		return await this.request<GetUrlsResponse>(config.api.endpoints.url.list, {
			method: 'GET'
		});
	}

	public async deleteUrl(id: number, values: DeleteUrlRequest): Promise<ApiResponse> {
		return await this.request(`${config.api.endpoints.url.delete}/${id}`, {
			method: 'DELETE',
			body: JSON.stringify(values)
		});
	}
}
