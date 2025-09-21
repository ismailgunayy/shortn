import { writable } from 'svelte/store';

export interface Cookie {
	name: string;
	value: string;
}

export type CookieMap = Record<string, string>;

function createCookieStore() {
	const { subscribe, set, update } = writable<CookieMap>({});

	return {
		subscribe,

		getCookie: (name: string): string | undefined => {
			let cookies: CookieMap = {};

			const unsubscribe = cookieStore.subscribe((value) => {
				cookies = value;
			});
			unsubscribe();

			return cookies[name];
		},

		getCookieString: () => {
			let cookies: CookieMap = {};

			const unsubscribe = cookieStore.subscribe((value) => {
				cookies = value;
			});
			unsubscribe();

			return Object.entries(cookies)
				.map(([name, value]) => `${name}=${value}`)
				.join('; ');
		},

		addCookie: (cookie: Cookie) =>
			update((currentCookies) => ({
				...currentCookies,
				[cookie.name]: cookie.value
			})),

		addCookies: (cookies: Cookie[]) =>
			update((currentCookies) => {
				const newCookies = cookies.reduce((acc, cookie) => {
					acc[cookie.name] = cookie.value;

					return acc;
				}, {} as CookieMap);
				return { ...currentCookies, ...newCookies };
			}),

		removeCookie: (name: string) =>
			update((currentCookies) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { [name]: _, ...rest } = currentCookies;
				return rest;
			}),

		clear: () => set({})
	};
}

export const cookieStore = createCookieStore();
