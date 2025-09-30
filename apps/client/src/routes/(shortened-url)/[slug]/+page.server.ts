import type { PageServerLoad } from './$types';
import { config } from '$lib/common/config';
import { resolveAndRedirect } from '$lib/utils/resolve-url.server';

export const load: PageServerLoad = async ({ params }) => {
	const shortenedUrl = `${config.HTTP.CLIENT_URL}/${params.slug}`;

	return resolveAndRedirect(shortenedUrl);
};
