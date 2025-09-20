import { API, API_CONTEXT } from './api';

import { AuthService } from './auth.service';
import { UrlService } from './url.service';

export function createApiServices(context: API_CONTEXT) {
	const httpClient = new API(context);

	return {
		auth: new AuthService(httpClient),
		url: new UrlService(httpClient)
	};
}

export const clientApi = createApiServices(API_CONTEXT.Client);
export const serverApi = createApiServices(API_CONTEXT.Server);
