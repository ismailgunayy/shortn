import { error, json, type RequestHandler } from '@sveltejs/kit';

import { serverApiService } from '$lib/services/api.server';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();
		const response = await serverApiService.shortenUrl({ url });

		return json(response);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('Error shortening URL:', err);
		throw error(500, 'Internal server error');
	}
};
