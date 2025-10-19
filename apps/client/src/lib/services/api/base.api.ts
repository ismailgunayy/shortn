import { authStore } from "$lib/stores/auth.store";
import { browser } from "$app/environment";
import { config } from "$lib/common/config";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { toastService } from "$lib/services/toast.service";

export interface ServiceConfig {
	apiKey?: string;
}

const TIMEOUT_DURATION = 10000; // 10 seconds

class TokenRefreshManager {
	private refreshPromise: Promise<boolean> | null = null;

	async refresh(
		makeRequest: (endpoint: string, options: RequestInit) => Promise<{ api: ApiResponse<unknown>; fetched: Response }>
	): Promise<boolean> {
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		try {
			this.refreshPromise = new Promise((resolve) => {
				makeRequest("auth/refresh", {
					method: "POST"
				})
					.then((response) => {
						resolve(response.api.success);
					})
					.catch(() => {
						resolve(false);
					});
			});

			const success = await this.refreshPromise;

			if (!success) {
				authStore.clear();

				toastService.error("Session expired. Please log in again.");

				goto(resolve("/web/login"));
			}

			return success;
		} finally {
			this.refreshPromise = null;
		}
	}
}

const tokenRefreshManager = new TokenRefreshManager();

export abstract class Service {
	constructor(protected serviceConfig?: ServiceConfig) {}

	public async request<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
		authStore.loading();

		const abortController = new AbortController();
		const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_DURATION);
		options.signal = abortController.signal;

		try {
			const response = await this.makeRequest<T>(endpoint, options);

			if (response.fetched.status === 401) {
				const refreshed = await tokenRefreshManager.refresh(this.makeRequest.bind(this));

				if (refreshed) {
					return (await this.makeRequest<T>(endpoint, options)).api;
				}

				return {
					success: false,
					error: { message: "Session expired" }
				};
			}

			return response.api;
		} catch {
			toastService.error("Network error occurred.", { id: "network-error" });

			return {
				success: false,
				error: { message: "Network error" }
			};
		} finally {
			clearTimeout(timeoutId);
			authStore.loaded();
		}
	}

	private async makeRequest<T>(endpoint: string, options: RequestInit) {
		const url = `${config.HTTP.API_BASE_URL}/${endpoint}`;

		const headers: HeadersInit = {
			...(options?.body && { "Content-Type": "application/json" }),
			...(!browser && this.serviceConfig?.apiKey && { Authorization: `Token ${this.serviceConfig.apiKey}` }),
			...options?.headers
		};

		const fetched = await fetch(url, {
			...options,
			...(browser && { credentials: "include" }),
			headers
		});

		const response = (await fetched.json()) as ApiResponse<T>;

		return {
			api: response,
			fetched
		};
	}
}

// Good practice, but I don't have time to implement this now :/
export interface ApiRequest<P = Record<string, unknown>, Q = Record<string, unknown>, B = Record<string, unknown>> {
	params?: P;
	query?: Q;
	body?: B;
}

export interface ApiError {
	message: string;
}

export interface ApiResponse<T = unknown> {
	data?: T;
	error?: ApiError;
	success: boolean;
}
