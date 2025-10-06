import { AuthService } from "./services/auth.service";
import { UrlService } from "./services/url.service";
import { env } from "$env/dynamic/private";

export const serverApi = {
	auth: new AuthService({ apiKey: env.API_KEY }),
	url: new UrlService({ apiKey: env.API_KEY })
};
