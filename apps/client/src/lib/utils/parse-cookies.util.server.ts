import type { Cookies } from "@sveltejs/kit";

export const parseCookies = (cookies: Cookies) => {
	return cookies
		.getAll()
		.map((c) => `${c.name}=${c.value}`)
		.join("; ");
};
