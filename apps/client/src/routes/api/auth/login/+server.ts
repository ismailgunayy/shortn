import { serverApi } from '$lib/api';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const values = await request.json();
		const response = await serverApi.auth.login(values);

		return json(response);
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('Error logging in:', err);
		throw error(500, 'Internal server error');
	}
};
