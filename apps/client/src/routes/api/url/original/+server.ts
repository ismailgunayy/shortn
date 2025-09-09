import { error, json, type RequestHandler } from '@sveltejs/kit';

import { serverApiService } from '$lib/services/server-api.server';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();
		const response = await serverApiService.getOriginalUrl({ url });

		return json(response);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}

		console.error('Error shortening URL:', err);
		throw error(500, 'Internal server error');
	}
};
