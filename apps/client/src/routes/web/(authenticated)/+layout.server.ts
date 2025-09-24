import type { LayoutServerLoad } from './$types';
import { requireAuth } from '$lib/utils/auth.server';

export const load: LayoutServerLoad = async ({ request }) => {
	const cookie = request.headers.get('cookie') ?? undefined;

	const user = await requireAuth(cookie);

	return {
		user
	};
};
