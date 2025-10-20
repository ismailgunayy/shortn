import { browser } from "$app/environment";

export enum StorageType {
	AUTH_USER = "shortn_session",
	EASTER_EGG_COUNTER = "shortn_easter_egg_counter"
}

export class StorageService {
	public get<T = string>(type: StorageType): T | null {
		if (!browser) {
			return null;
		}

		try {
			const value = localStorage.getItem(type);
			if (value === null) {
				return null;
			}

			try {
				return JSON.parse(value) as T;
			} catch {
				return value as T;
			}
		} catch (err) {
			console.error(`Failed to get storage item ${type}:`, err);
			return null;
		}
	}

	public set(type: StorageType, value: unknown): void {
		if (!browser) {
			return;
		}

		try {
			const stringValue = typeof value === "string" ? value : JSON.stringify(value);
			localStorage.setItem(type, stringValue);
		} catch (err) {
			console.error(`Failed to set storage item ${type}:`, err);
		}
	}

	public remove(type: StorageType): void {
		if (!browser) {
			return;
		}

		try {
			localStorage.removeItem(type);
		} catch (err) {
			console.error(`Failed to remove storage item ${type}:`, err);
		}
	}

	public clear(): void {
		if (!browser) {
			return;
		}

		try {
			Object.values(StorageType).forEach((key) => {
				localStorage.removeItem(key);
			});
		} catch (err) {
			console.error("Failed to clear storage:", err);
		}
	}
}

export const storageService = new StorageService();
