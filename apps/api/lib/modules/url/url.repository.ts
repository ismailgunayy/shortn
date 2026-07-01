import { CustomUrlQuerySchema, UrlQuerySchema } from "~/modules/url/url.schema";
import { DB, ShortnCustomUrls, ShortnUrls } from "~/types/db";
import { Insertable, Kysely, SelectType, Updateable } from "kysely";

import z from "zod";

export class UrlRepository {
	constructor(private db: Kysely<DB>) {}

	// ------------------- URL ------------------- //

	async insertGeneratedUrl(values: Insertable<ShortnUrls>) {
		return await this.db.insertInto("shortn.urls").values(values).returning(["id"]).executeTakeFirstOrThrow();
	}

	async deleteGeneratedUrl(id: SelectType<ShortnUrls["id"]>, userId: SelectType<ShortnUrls["userId"]>) {
		return await this.db.deleteFrom("shortn.urls").where("id", "=", id).where("userId", "=", userId).execute();
	}

	async findGeneratedUrl(id: SelectType<ShortnUrls["id"]>) {
		return await this.db.selectFrom("shortn.urls").selectAll().where("id", "=", id).executeTakeFirst();
	}

	async findGeneratedUrlByUrl(url: SelectType<ShortnUrls["url"]>, userId: SelectType<ShortnUrls["userId"]>) {
		return await this.db
			.selectFrom("shortn.urls")
			.selectAll()
			.where("url", "=", url)
			.where("userId", "=", userId)
			.executeTakeFirst();
	}

	async findAllGeneratedUrlsByUserId(urlQuery: z.infer<typeof UrlQuerySchema>, userId: number) {
		const { page, limit, sortBy, sortOrder, search } = urlQuery;

		let query = this.db
			.selectFrom("shortn.urls")
			.selectAll()
			.where("userId", "=", userId)
			.limit(limit)
			.offset((page - 1) * limit)
			.orderBy(sortBy, sortOrder);

		if (search) {
			query = query.where("url", "ilike", `%${search}%`);
		}

		return await query.execute();
	}

	async countGeneratedUrlsByUserId(userId: SelectType<ShortnUrls["userId"]>, search?: string) {
		let query = this.db
			.selectFrom("shortn.urls")
			.select(this.db.fn.count("id").as("count"))
			.where("userId", "=", userId);

		if (search) {
			query = query.where("url", "ilike", `%${search}%`);
		}

		const result = await query.executeTakeFirst();

		return result ? Number(result.count) : 0;
	}

	// ------------------- CUSTOM URL ------------------- //

	async insertCustomUrl(values: Insertable<ShortnCustomUrls>) {
		return await this.db.insertInto("shortn.customUrls").values(values).returning(["id"]).executeTakeFirstOrThrow();
	}

	async updateCustomUrl(
		id: SelectType<ShortnCustomUrls["id"]>,
		userId: SelectType<ShortnCustomUrls["userId"]>,
		values: Updateable<ShortnCustomUrls>
	) {
		return await this.db
			.updateTable("shortn.customUrls")
			.set(values)
			.where("id", "=", id)
			.where("userId", "=", userId)
			.returningAll()
			.executeTakeFirstOrThrow();
	}

	async deleteCustomUrl(id: SelectType<ShortnCustomUrls["id"]>, userId: SelectType<ShortnCustomUrls["userId"]>) {
		return await this.db.deleteFrom("shortn.customUrls").where("id", "=", id).where("userId", "=", userId).execute();
	}

	async findCustomUrl(id: SelectType<ShortnCustomUrls["id"]>, userId: SelectType<ShortnCustomUrls["userId"]>) {
		return await this.db
			.selectFrom("shortn.customUrls")
			.selectAll()
			.where("id", "=", id)
			.where("userId", "=", userId)
			.executeTakeFirst();
	}

	async findCustomUrlByCustomCode(customCode: SelectType<ShortnCustomUrls["customCode"]>) {
		return await this.db
			.selectFrom("shortn.customUrls")
			.select("url")
			.where("customCode", "=", customCode)
			.executeTakeFirst();
	}

	async findAllCustomUrlsByUserId(
		urlQuery: z.infer<typeof CustomUrlQuerySchema>,
		userId: SelectType<ShortnCustomUrls["userId"]>
	) {
		const { page, limit, sortBy, sortOrder, search } = urlQuery;

		let query = this.db
			.selectFrom("shortn.customUrls")
			.selectAll()
			.where("userId", "=", userId)
			.limit(limit)
			.offset((page - 1) * limit)
			.orderBy(sortBy, sortOrder);

		if (search) {
			query = query.where((eb) => eb.or([eb("url", "ilike", `%${search}%`), eb("customCode", "ilike", `%${search}%`)]));
		}

		return await query.execute();
	}

	async countCustomUrlsByUserId(userId: SelectType<ShortnCustomUrls["userId"]>, search: string | undefined) {
		let query = this.db
			.selectFrom("shortn.customUrls")
			.select(this.db.fn.count("id").as("count"))
			.where("userId", "=", userId);

		if (search) {
			query = query.where((eb) => eb.or([eb("url", "ilike", `%${search}%`), eb("customCode", "ilike", `%${search}%`)]));
		}

		const result = await query.executeTakeFirst();

		return result ? Number(result.count) : 0;
	}
}
