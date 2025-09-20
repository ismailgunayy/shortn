import { App } from "~/types/fastify";

const BASE = 62;
const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export class UrlHelper {
	constructor(private readonly app: App) {}

	public encodeId = (num: number): string => {
		if (num === 0) return "0";
		if (num < 0) return "";

		let result = "";

		while (num > 0) {
			result = BASE62_ALPHABET[num % BASE] + result;
			num = Math.floor(num / BASE);
		}

		return result;
	};

	public decodeId = (str: string): number => {
		if (!str) return 0;

		let result = 0;
		const length = str.length;

		for (let i = 0; i < length; i++) {
			const char = str[i];
			if (!char) return 0;

			const index = BASE62_ALPHABET.indexOf(char);
			if (index === -1) return 0;

			result += index * Math.pow(BASE, length - 1 - i);
		}

		return result;
	};

	public isUrlValid(url: string) {
		try {
			const parsed = new URL(url);

			if (this.app.config.IS_LOCAL) {
				return true;
			}

			return parsed.protocol === "https:" && parsed.hostname.length > 0 && parsed.hostname.includes(".");
		} catch {
			return false;
		}
	}

	public isShortenedUrlValid(url: string) {
		if (this.isUrlValid(url) && url.includes(this.app.config.HTTP.CLIENT_URL)) {
			return true;
		}

		return false;
	}
}
