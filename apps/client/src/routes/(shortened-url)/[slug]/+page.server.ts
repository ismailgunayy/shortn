import type { PageServerLoad } from './$types';
import { config } from '$lib/common/config';
import { resolveAndRedirect } from '$lib/utils/url-resolver.server';

export const load: PageServerLoad = async ({ params }) => {
	const shortenedUrl = `${config.env.VITE_CLIENT_URL}/${params.slug}`;
	return resolveAndRedirect(shortenedUrl);
};
