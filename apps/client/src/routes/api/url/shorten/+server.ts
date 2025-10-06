import type { RequestHandler } from "@sveltejs/kit";
import { prepareCookieString } from "$lib/utils/parseCookies";
import { serverApi } from "$lib/api/api.server";

/**
 * This is a workaround to avoid exposing the API Key to the client.
 * Since the only endpoints that I want them to be able to access
 * without logging in are the url/shorten and url/original endpoints,
 * I am creating this proxy endpoint to handle the url shortening with
 * the API Key of service account securely stored on the server.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();
	const response = await serverApi.url.shorten(body, {
		headers: {
			cookie: prepareCookieString(cookies)
		}
	});

	return new Response(JSON.stringify(response));
};
