import { serverApi } from '$lib/api';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const response = await serverApi.auth.status();

		return json(response);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('Error fetching user data:', err);
		throw error(500, 'Internal server error');
	}
};
