import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("shortn.urls")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("url", "text", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("shortn.urls").execute();
}
