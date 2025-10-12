import { App } from "~/types/fastify";
import { InvalidShortenedUrl } from "~/errors";

const BASE = 62;
const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export enum URLSegment {
	CUSTOM = "c"
}

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

	public buildUrl(shortCode: string, segment?: URLSegment) {
		if (segment === URLSegment.CUSTOM) {
			return `${this.app.config.HTTP.CLIENT_URL}/${URLSegment.CUSTOM}/${shortCode}`;
		}

		return `${this.app.config.HTTP.CLIENT_URL}/${shortCode}`;
	}

	public parseShortenedUrl(shortenedUrl: string) {
		let path,
			isCustom = false;

		path = shortenedUrl.replace(this.app.config.HTTP.CLIENT_URL + "/", "");

		if (!path) {
			throw new InvalidShortenedUrl();
		}

		if (path.startsWith(`${URLSegment.CUSTOM}/`)) {
			isCustom = true;
			path = path.replace(`${URLSegment.CUSTOM}/`, "");
		}

		return {
			isCustom,
			shortCode: path
		};
	}

	public isCustomUrl(shortenedUrl: string) {
		return new URL(shortenedUrl).pathname.includes(`/${URLSegment.CUSTOM}`);
	}
}
