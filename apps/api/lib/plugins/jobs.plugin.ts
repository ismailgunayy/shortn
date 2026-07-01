import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";

import { App } from "~/types/fastify";
import fastifyPlugin from "fastify-plugin";
import fastifySchedule from "@fastify/schedule";

export const jobs = fastifyPlugin(async (app: App) => {
	await app.register(fastifySchedule);

	const task = new AsyncTask(
		"Cleanup expired Sessions",
		async () => {
			await app.db
				.deleteFrom("shortn.sessions")
				.where(
					"id",
					"in",
					app.db
						.selectFrom("shortn.sessions")
						.select("id")
						.where("expiresAt", "<", new Date())
						.limit(1000)
						.forUpdate()
						.skipLocked()
				)
				.execute();
		},
		(err) => {
			app.log.error(err);
		}
	);
	const job = new SimpleIntervalJob({ minutes: 1 }, task);
	app.scheduler.addSimpleIntervalJob(job);
});
