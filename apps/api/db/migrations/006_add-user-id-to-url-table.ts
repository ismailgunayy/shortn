import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable("shortn.urls")
		.addColumn("user_id", "integer", (col) => col.notNull().references("shortn.users.id").onDelete("cascade"))
		.execute();

	await db.schema.createIndex("idx_urls_user_id").on("shortn.urls").column("user_id").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropIndex("idx_urls_user_id").on("shortn.urls").execute();
	await db.schema.alterTable("shortn.urls").dropColumn("user_id").execute();
}
