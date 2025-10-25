import { Service, type ApiRequestOptions, type ApiResponse, type ServiceConfig } from "./base.api";
import { config } from "$lib/common/config";
import { toastService } from "$lib/services/toast.service";
import { CacheKind, cacheService } from "../cache.service";

export class UrlService extends Service {
	constructor(config?: ServiceConfig) {
		super(config);
	}

	public async shortenUrl(
		payload: ShortenUrlPayload,
		options?: ApiRequestOptions
	): Promise<ApiResponse<ShortenUrlResponse>> {
		if (!payload.url.trim()) {
			throw new Error("Please enter a URL");
		}

		if (config.MODE !== "development" && !payload.url.match(/^https:\/\/.+\..+/)) {
			throw new Error("Please enter a valid URL (starting with https://)");
		}

		const response = await this.request<ShortenUrlResponse>("url/shorten", {
			method: "POST",
			body: JSON.stringify(payload),
			...options
		});

		if (response.success) {
			if (payload.customCode) {
				cacheService.remove(CacheKind.CUSTOM_URLS);
			} else {
				cacheService.remove(CacheKind.GENERATED_URLS);
			}
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async redirectUrl(payload: RedirectUrlPayload): Promise<ApiResponse<RedirectUrlResponse>> {
		return await this.request<RedirectUrlResponse>("url/redirect", {
			method: "POST",
			body: JSON.stringify(payload)
		});
	}

	public async getGeneratedUrls(query?: UrlQueryParams): Promise<ApiResponse<GetGeneratedUrlsResponse>> {
		const response = await this.request<GetGeneratedUrlsResponse>("url/generated", {
			method: "GET",
			query,
			caching: {
				kind: CacheKind.GENERATED_URLS
			}
		});

		if (!response.success && response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async getCustomUrls(query?: CustomUrlQueryParams): Promise<ApiResponse<GetCustomUrlsResponse>> {
		const response = await this.request<GetCustomUrlsResponse>("url/custom", {
			method: "GET",
			query,
			caching: {
				kind: CacheKind.CUSTOM_URLS
			}
		});

		if (!response.success && response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async updateCustomUrl(
		id: number,
		payload: UpdateCustomUrlPayload
	): Promise<ApiResponse<UpdateCustomUrlResponse>> {
		const response = await this.request<UpdateCustomUrlResponse>(`url/${id}`, {
			method: "POST",
			body: JSON.stringify(payload)
		});

		if (response.success && response.data) {
			cacheService.remove(CacheKind.CUSTOM_URLS);
			toastService.success("Custom URL updated successfully.");
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}

	public async deleteUrl(id: number, payload: DeleteUrlPayload, isCustom: boolean): Promise<ApiResponse> {
		const response = await this.request(`url/${id}`, {
			method: "DELETE",
			body: JSON.stringify(payload)
		});

		if (response.success) {
			if (isCustom) {
				cacheService.remove(CacheKind.CUSTOM_URLS);
			} else {
				cacheService.remove(CacheKind.GENERATED_URLS);
			}
			toastService.success("URL deleted successfully.");
		} else if (response.error) {
			toastService.error(response.error);
		}

		return response;
	}
}

export interface ShortenUrlPayload {
	url: string;
	customCode?: string;
}

export interface ShortenUrlResponse {
	url: string;
}

export interface RedirectUrlPayload {
	url: string;
}

export interface RedirectUrlResponse {
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

export interface GetGeneratedUrlsResponse {
	urls: UrlItem[];
	pagination: PaginationMeta;
}

export interface GetCustomUrlsResponse {
	customUrls: CustomUrlItem[];
	pagination: PaginationMeta;
}

export interface UpdateCustomUrlPayload {
	originalUrl: string;
}

export interface UpdateCustomUrlResponse {
	id: number;
	originalUrl: string;
	shortenedUrl: string;
	customCode: string;
	createdAt: string;
}

export interface DeleteUrlPayload {
	shortenedUrl: string;
}

export interface UrlQueryParams {
	page?: number;
	limit?: number;
	sortBy?: "url" | "createdAt";
	sortOrder?: "asc" | "desc";
	search?: string;
}

export interface CustomUrlQueryParams extends Omit<UrlQueryParams, "sortBy"> {
	sortBy?: "url" | "createdAt" | "customCode";
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
	sortBy: "url" | "createdAt" | "customCode";
	sortOrder: "asc" | "desc";
}
