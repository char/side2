import { collectJobInputs, collectJobs, Context } from "@char/side2";

const ctx = new Context({ source: "./src", destination: "./public" });

const jobs = await collectJobs(ctx);
const jobInputs = await Promise.all(jobs.map(j => collectJobInputs(ctx, j)));

// we have to run tasks sequentially because they each usually expect
// to have their own `document` global :(
for (let i = 0; i < jobs.length; i++) {
  const job = jobs[i];
  const inputs = jobInputs[i];
  await job.build(ctx, inputs);
}

const writes = ctx.output.entries().map(([name, content]) => {
  console.log("[+] " + name);
  ctx.write(name, content);
});
await Promise.all(writes);
