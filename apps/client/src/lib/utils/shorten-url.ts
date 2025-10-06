import type { ApiResponse } from "$lib/api/services/service";
import type { ShortenUrlResponse } from "$lib/api/services/url.service";

export const shortenUrl = async (url: string, customCode?: string): Promise<ApiResponse<ShortenUrlResponse>> => {
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

	return await fetched.json();
};
