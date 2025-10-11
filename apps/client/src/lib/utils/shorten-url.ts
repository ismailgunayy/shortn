import type { ApiResponse } from "$lib/api/services/service";
import type { ShortenUrlResponse } from "$lib/api/services/url.service";
import { errorStore } from "$lib/stores/error.store";

export const shortenUrl = async (url: string, customCode?: string): Promise<ApiResponse<ShortenUrlResponse>> => {
	try {
		const fetched = await fetch("/api/url/shorten", {
			credentials: "include",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: document.cookie
			},
			body: JSON.stringify({
				url,
				customCode
			})
		});

		const response = await fetched.json();

		if (!response.success) {
			errorStore.handleApiError(response, {
				source: "shortenUrl",
				action: "shorten_url",
				statusCode: fetched.status
			});
		}

		return response;
	} catch (err) {
		errorStore.handleNetworkError(err, {
			source: "shortenUrl",
			action: "shorten_url"
		});

		return {
			success: false,
			error: {
				message: "Failed to shorten URL"
			}
		};
	}
};
