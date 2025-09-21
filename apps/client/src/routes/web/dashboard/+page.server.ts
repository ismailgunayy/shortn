import type { ServerLoad } from '@sveltejs/kit';
import { requireAuth } from '$lib/utils/auth.server';

export const load: ServerLoad = async () => {
	const user = await requireAuth();

	return {
		user
	};
};
