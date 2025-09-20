import { sql, type Kysely } from "kysely";
import { createUpdatedAtTrigger } from "../common";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("shortn.custom_urls")
		.ifNotExists()
		.addColumn("id", "integer", (col) => col.primaryKey().generatedAlwaysAsIdentity())
		.addColumn("user_id", "integer", (col) => col.notNull().references("shortn.users.id").onDelete("cascade"))
		.addColumn("url", "text", (col) => col.notNull())
		.addColumn("custom_code", "text", (col) => col.notNull().unique())
		.addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
		.execute();

	await db.schema.createIndex("idx_custom_urls_user_id").on("shortn.custom_urls").column("user_id").execute();
	await createUpdatedAtTrigger("custom_urls", db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropIndex("idx_custom_urls_user_id").on("shortn.custom_urls").execute();
	await db.schema.dropTable("shortn.custom_urls").ifExists().execute();
}
