const BASE = 62;
const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const convertToBase62 = (num: number): string => {
	if (num === 0) return "0";
	if (num < 0) return "";

	let result = "";

	while (num > 0) {
		result = BASE62_ALPHABET[num % BASE] + result;
		num = Math.floor(num / BASE);
	}

	return result;
};

export const convertFromBase62 = (str: string): number => {
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
