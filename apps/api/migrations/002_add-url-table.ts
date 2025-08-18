import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("shortn.urls")
		.addColumn("id", "integer", (col) => col.primaryKey().generatedAlwaysAsIdentity())
		.addColumn("url", "text", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
		.ifNotExists()
		.execute();

	// Set the id column to start from 10000
	await sql`ALTER TABLE shortn.urls ALTER COLUMN id RESTART WITH 10000`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("shortn.urls").ifExists().execute();
}
