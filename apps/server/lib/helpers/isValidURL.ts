export const isValidUrl = (url: string): boolean => {
	try {
		const parsed = new URL(url);

		return parsed.protocol === "https:" && Boolean(parsed.hostname) && parsed.hostname.includes(".");
	} catch {
		return false;
	}
};

// TODO: Implement isValidShortenedURL
