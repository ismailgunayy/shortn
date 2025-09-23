import type { LayoutServerLoad } from './$types';
import { requireAuth } from '$lib/utils/auth.server';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = await requireAuth(cookies);

	return {
		user
	};
};
