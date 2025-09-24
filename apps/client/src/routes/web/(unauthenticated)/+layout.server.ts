import type { LayoutServerLoad } from './$types';
import { redirectIfAuthenticated } from '$lib/utils/auth.server';

export const load: LayoutServerLoad = async ({ request }) => {
	const cookie = request.headers.get('cookie') ?? undefined;

	return await redirectIfAuthenticated('/', cookie);
};
