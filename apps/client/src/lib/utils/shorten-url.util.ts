import type { ApiResponse } from "$lib/services/api/base.api";
import type { ShortenUrlResponse } from "$lib/services/api/url.api";
import { toastService } from "$lib/services/toast.service";

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

		if (response.error) {
			toastService.error(`Failed to shorten URL.`);
		}

		return response;
	} catch {
		toastService.error("Network error occurred.");

		return {
			success: false,
			error: {
				message: "Failed to shorten URL"
			}
		};
	}
};
