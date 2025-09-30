import type { User } from '$lib/stores/auth.store';
import { redirect, type Cookies } from '@sveltejs/kit';
import { serverApi } from '$lib/api/api.server';
import { prepareCookieString } from './parseCookies';

export async function checkAuthStatus(cookies: Cookies): Promise<User | undefined> {
	try {
		const response = await serverApi.auth.status({
			headers: {
				Cookie: prepareCookieString(cookies)
			}
		});

		if (response.success && response.data?.isAuthenticated && response.data?.user) {
			return response.data.user;
		}

		return;
	} catch (error) {
		console.warn('Auth status check failed:', error);
		return;
	}
}

export async function requireAuth(cookies: Cookies): Promise<User> {
	const user = await checkAuthStatus(cookies);

	if (!user) {
		throw redirect(302, '/web/login');
	}

	return user;
}

export async function redirectIfAuthenticated(
	redirectTo: string = '/',
	cookies: Cookies
): Promise<void> {
	const user = await checkAuthStatus(cookies);

	if (user) {
		throw redirect(302, redirectTo);
	}
}
