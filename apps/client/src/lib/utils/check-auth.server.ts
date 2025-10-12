import type { User } from "$lib/stores/auth.store";
import { type Cookies } from "@sveltejs/kit";
import { serverApi } from "$lib/api/api.server";
import { parseCookies } from "./parse-cookies.server";

export async function checkAuthStatus(cookies: Cookies): Promise<User | undefined> {
	try {
		const response = await serverApi.auth.status({
			headers: {
				Cookie: parseCookies(cookies)
			}
		});

		if (response.success && response.data?.isAuthenticated && response.data?.user) {
			return response.data.user;
		}

		return;
	} catch (err) {
		console.warn("Auth status check failed:", err);
		return;
	}
}
