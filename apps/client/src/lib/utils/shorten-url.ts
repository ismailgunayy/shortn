import type { ApiResponse, ShortenUrlResponse } from '$lib/types/api.types';

export const shortenUrl = async (
	url: string,
	customCode?: string
): Promise<ApiResponse<ShortenUrlResponse>> => {
	const fetched = await fetch('/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			url,
			customCode
		})
	});

	return await fetched.json();
};
