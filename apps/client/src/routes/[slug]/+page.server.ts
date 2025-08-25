import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { apiService } from '$lib/services/api';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const response = await apiService.getOriginalUrl(url.href);

		if (response.error) {
			throw error(500, response.error || 'Failed to resolve URL');
		}

		if (!response?.data?.url) {
			throw error(500, 'Invalid response from API');
		}

		throw redirect(302, response.data.url);
	} catch (err) {
		if (err && typeof err === 'object' && ('status' in err || 'location' in err)) {
			throw err;
		}

		console.error('Redirect error:', err);
		throw error(500, 'Failed to resolve short URL');
	}
};
