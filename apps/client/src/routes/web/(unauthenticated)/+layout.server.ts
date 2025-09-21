import type { LayoutServerLoad } from './$types';
import { cookieStore } from '$lib/stores/cookies.store';
import { redirectIfAuthenticated } from '$lib/utils/auth.server';

export const load: LayoutServerLoad = async ({ cookies }) => {
	cookieStore.addCookies(cookies.getAll());

	await redirectIfAuthenticated();
};
