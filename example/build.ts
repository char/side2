import { collectJobs, Context, execute } from "@char/side2";

const ctx = new Context({ source: "./src", destination: "./public" });
const jobs = await collectJobs(ctx);
await execute(ctx, jobs);
