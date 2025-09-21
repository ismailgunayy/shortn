import { error, redirect } from '@sveltejs/kit';

import { api } from '$lib/api';

export async function resolveAndRedirect(shortenedUrl: string) {
	try {
		const response = await api.url.getOriginal({ url: shortenedUrl });

		if (response.error || !response.data?.url) {
			throw error(500, response.error || 'Failed to resolve URL');
		}

		return redirect(302, response.data.url);
	} catch (err) {
		if (err && typeof err === 'object' && ('status' in err || 'location' in err)) {
			throw err;
		}

		console.error('Redirect error:', err);
		throw error(500, 'Failed to resolve short URL');
	}
}
