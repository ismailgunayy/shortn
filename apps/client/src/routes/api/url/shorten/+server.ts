import type { RequestHandler } from "@sveltejs/kit";
import { parseCookies } from "$lib/utils/parse-cookies.util.server";
import { serverApi } from "$lib/services/api/api.server";

/**
 * This is a workaround to avoid exposing the API Key to the client.
 * Since the only endpoints that I want accessible without logging in
 * are the url/shorten and url/redirect endpoints, I am creating this
 * proxy endpoint to handle URL shortening with the service account's
 * API Key securely stored on the server.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = await request.json();
	const response = await serverApi.url.shortenUrl(body, {
		headers: {
			cookie: parseCookies(cookies)
		}
	});

	return new Response(JSON.stringify(response));
};
