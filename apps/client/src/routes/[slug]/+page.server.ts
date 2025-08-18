import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { config } from '$lib/common/config';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params;

	// Validate the slug format (base62 characters)
	if (!slug || !/^[a-zA-Z0-9]+$/.test(slug)) {
		throw error(400, 'Invalid short URL format');
	}

	try {
		// First, get an auth token
		const authResponse = await fetch(`${config.api.baseUrl}/api/auth`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!authResponse.ok) {
			throw error(500, 'Authentication failed');
		}

		const authData = await authResponse.json();
		const token = authData.accessToken;

		// Now make request to get the original URL
		// Construct the shortened URL using the current origin
		const shortenedUrl = `${config.env.VITE_CLIENT_URL}/${slug}`;
		const apiUrl = `${config.api.baseUrl}/api/url/original`;

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ url: shortenedUrl })
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));

			if (response.status === 400 || response.status === 404) {
				throw error(404, 'Short URL not found');
			}

			throw error(response.status, errorData.error || 'Failed to resolve URL');
		}

		const data = await response.json();

		if (!data.url) {
			throw error(500, 'Invalid response from API');
		}

		// Redirect to the original URL
		throw redirect(302, data.url);
	} catch (err) {
		// If it's already a SvelteKit error or redirect, re-throw it
		if (err && typeof err === 'object' && ('status' in err || 'location' in err)) {
			throw err;
		}

		// Otherwise, it's a network or other error
		console.error('Redirect error:', err);
		throw error(500, 'Failed to resolve short URL');
	}
};
