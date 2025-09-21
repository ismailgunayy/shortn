import type { LayoutServerLoad } from './$types';
import { cookieStore } from '$lib/stores/cookies.store';
import { requireAuth } from '$lib/utils/auth.server';

export const load: LayoutServerLoad = async ({ cookies }) => {
	cookieStore.addCookies(cookies.getAll());

	const user = await requireAuth();

	return {
		user
	};
};
