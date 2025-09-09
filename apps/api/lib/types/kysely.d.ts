import { Pool } from "pg";

declare module "kysely" {
	interface Kysely {
		pool: Pool;
	}
}
