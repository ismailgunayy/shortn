import type { LayoutServerLoad } from './$types';
import { requireAuth } from '$lib/utils/auth.server';

export const load: LayoutServerLoad = async ({ cookies }) => {
	console.log('🔐 Auth Layout - Cookies:', cookies.getAll());
	console.log(
		'🔐 Auth Layout - Cookie string:',
		cookies
			.getAll()
			.map((c) => `${c.name}=${c.value}`)
			.join('; ')
	);

	const user = await requireAuth(cookies);

	return {
		user
	};
};
