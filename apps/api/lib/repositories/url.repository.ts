import { DB, ShortnCustomUrls, ShortnUrls } from "~/types/db";
import { Insertable, Kysely, Updateable } from "kysely";

export class UrlRepository {
	constructor(private db: Kysely<DB>) {}

	// ------------------- URL ------------------- //

	async insertUrl(values: Insertable<ShortnUrls>) {
		return await this.db.insertInto("shortn.urls").values(values).returning(["id"]).executeTakeFirstOrThrow();
	}

	async deleteUrl(id: number, userId: number) {
		return await this.db.deleteFrom("shortn.urls").where("id", "=", id).where("userId", "=", userId).execute();
	}

	async findUrlById(id: number) {
		return await this.db.selectFrom("shortn.urls").selectAll().where("id", "=", id).executeTakeFirst();
	}

	async findUrlByUrl(url: ShortnUrls["url"], userId: number) {
		return await this.db
			.selectFrom("shortn.urls")
			.selectAll()
			.where("url", "=", url)
			.where("userId", "=", userId)
			.executeTakeFirst();
	}

	async findAllUrlsByUserId(userId: number) {
		return await this.db.selectFrom("shortn.urls").selectAll().where("userId", "=", userId).execute();
	}

	// ------------------- CUSTOM URL ------------------- //

	async insertCustomUrl(values: Insertable<ShortnCustomUrls>) {
		return await this.db.insertInto("shortn.customUrls").values(values).returning(["id"]).executeTakeFirstOrThrow();
	}

	async updateCustomUrl(id: number, userId: number, values: Updateable<ShortnCustomUrls>) {
		return await this.db
			.updateTable("shortn.customUrls")
			.set(values)
			.where("id", "=", id)
			.where("userId", "=", userId)
			.returningAll()
			.executeTakeFirstOrThrow();
	}

	async deleteCustomUrl(id: number, userId: number) {
		return await this.db.deleteFrom("shortn.customUrls").where("id", "=", id).where("userId", "=", userId).execute();
	}

	async findCustomUrlById(id: number, userId: number) {
		return await this.db
			.selectFrom("shortn.customUrls")
			.selectAll()
			.where("id", "=", id)
			.where("userId", "=", userId)
			.executeTakeFirst();
	}

	async findCustomUrlByCustomCode(customCode: ShortnCustomUrls["customCode"]) {
		return await this.db
			.selectFrom("shortn.customUrls")
			.select("url")
			.where("customCode", "=", customCode)
			.executeTakeFirst();
	}

	async findAllCustomUrlsByUserId(userId: number) {
		return await this.db.selectFrom("shortn.customUrls").selectAll().where("userId", "=", userId).execute();
	}
}
