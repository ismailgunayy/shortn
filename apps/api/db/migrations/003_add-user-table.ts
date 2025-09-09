import { sql, type Kysely } from "kysely";
import { createUpdatedAtTrigger } from "../common";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("shortn.users")
		.ifNotExists()
		.addColumn("id", "integer", (col) => col.primaryKey().generatedAlwaysAsIdentity())
		.addColumn("full_name", "text", (col) => col.notNull())
		.addColumn("email", "text", (col) => col.notNull().unique())
		.addColumn("password", "text", (col) => col.notNull())
		.addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
		.execute();

	await createUpdatedAtTrigger("users", db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("shortn.users").ifExists().execute();
}
