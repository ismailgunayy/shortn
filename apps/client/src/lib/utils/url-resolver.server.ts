import { error, redirect } from '@sveltejs/kit';

import { clientApiService } from '$lib/services/api';

/**
 * Resolves a shortened URL and redirects to the original URL
 * @param shortenedUrl - The full shortened URL to resolve
 * @returns A redirect response to the original URL
 * @throws Error if the URL cannot be resolved
 */
export async function resolveAndRedirect(shortenedUrl: string) {
	try {
		const response = await clientApiService.getOriginalUrl({ url: shortenedUrl });

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
