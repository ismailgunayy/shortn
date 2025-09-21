import type { ServerLoad } from '@sveltejs/kit';
import { redirectIfAuthenticated } from '$lib/utils/auth.server';

export const load: ServerLoad = async () => {
	await redirectIfAuthenticated();
};
