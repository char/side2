import { collectJobs, Context } from "@char/ssg";

const ctx = new Context({ source: "./src", destination: "./public" });

const jobs = await collectJobs(ctx);
// we have to run tasks sequentially because they each usually expect
// to have their own `document` global :(
for (const job of jobs) {
  await job.build(ctx);
}
