import { serverApi } from '$lib/api';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async () => {
	try {
		const response = await serverApi.auth.refresh();

		return json(response);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('Error refreshing token:', err);
		throw error(500, 'Internal server error');
	}
};
