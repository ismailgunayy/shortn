import { Service, type ApiResponse, type ServiceConfig } from "./service";
import { config } from "$lib/common/config";

export class UrlService extends Service {
	constructor(config?: ServiceConfig) {
		super(config);
	}

	public async shorten(values: ShortenUrlRequest, options?: RequestInit): Promise<ApiResponse<ShortenUrlResponse>> {
		if (!values.url.trim()) {
			throw new Error("Please enter a URL");
		}

		if (config.MODE !== "development" && !values.url.match(/^https:\/\/.+\..+/)) {
			throw new Error("Please enter a valid URL (starting with https://)");
		}

		const body: ShortenUrlRequest = { url: values.url };
		if (values.customCode?.trim()) {
			body.customCode = values.customCode.trim();
		}

		return await this.request<ShortenUrlResponse>("url/shorten", {
			method: "POST",
			body: JSON.stringify(body),
			...options
		});
	}

	public async getOriginal(
		values: OriginalUrlRequest,
		options?: RequestInit
	): Promise<ApiResponse<OriginalUrlResponse>> {
		return await this.request<OriginalUrlResponse>("url/original", {
			method: "POST",
			body: JSON.stringify(values),
			...options
		});
	}

	public async getUserUrls(options?: RequestInit): Promise<ApiResponse<GetUrlsResponse>> {
		return await this.request<GetUrlsResponse>("url", {
			method: "GET",
			...options
		});
	}

	public async updateCustomUrl(
		values: UpdateCustomUrlRequest,
		options?: RequestInit
	): Promise<ApiResponse<UpdateCustomUrlResponse>> {
		return await this.request<UpdateCustomUrlResponse>(`url/${values.id}`, {
			method: "POST",
			body: JSON.stringify(values),
			...options
		});
	}

	public async deleteUrl(id: number, values: DeleteUrlRequest, options?: RequestInit): Promise<ApiResponse> {
		return await this.request(`url/${id}`, {
			method: "DELETE",
			body: JSON.stringify(values),
			...options
		});
	}
}

export interface ShortenUrlRequest {
	url: string;
	customCode?: string;
}

export interface ShortenUrlResponse {
	url: string;
}

export interface OriginalUrlRequest {
	url: string;
}

export interface OriginalUrlResponse {
	url: string;
}

export interface UrlItem {
	id: number;
	originalUrl: string;
	shortenedUrl: string;
	shortCode: string;
	createdAt: string;
}

export interface CustomUrlItem {
	id: number;
	originalUrl: string;
	shortenedUrl: string;
	customCode: string;
	createdAt: string;
}

export interface GetUrlsResponse {
	urls: UrlItem[];
	customUrls: CustomUrlItem[];
}

export interface UpdateCustomUrlRequest {
	id: number;
	originalUrl: string;
}

export interface UpdateCustomUrlResponse {
	id: number;
	originalUrl: string;
	shortenedUrl: string;
	customCode: string;
	createdAt: string;
}

export interface DeleteUrlRequest {
	shortenedUrl: string;
}
