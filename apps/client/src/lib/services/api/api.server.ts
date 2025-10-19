import { AuthService } from "./auth.api";
import { UrlService } from "./url.api";
import { env } from "$env/dynamic/private";

export const serverApi = {
	auth: new AuthService({ apiKey: env.API_KEY }),
	url: new UrlService({ apiKey: env.API_KEY })
};
