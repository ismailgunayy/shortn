import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema.createSchema("shortn").ifNotExists().execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropSchema("shortn").ifExists().execute();
}
