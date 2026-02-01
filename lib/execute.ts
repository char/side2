import * as col from "@std/fmt/colors";
import type { Context } from "./context.ts";
import { collectJobInputs, type Job } from "./job.ts";

export async function execute(
  ctx: Context,
  jobs: Job[],
  opts: {
    log?: (msg: string) => void;
    color?: boolean;
  } = {},
): Promise<void> {
  const { log = console.log satisfies (msg: string) => void, color = true } = opts;

  const colorGate = <F extends (s: string) => string>(f: F) => (color ? f : (s: string) => s);
  const cyan = colorGate(col.brightCyan);
  const green = colorGate(col.brightGreen);
  const red = colorGate(col.brightRed);

  const jobInputsResults = await Promise.allSettled(
    jobs.map(async job => {
      const inputs = await collectJobInputs(ctx, job);
      log(
        `${cyan("[*]")} ${Object.keys(inputs)
          .map(it => ctx.source + "/" + it)
          .join(", ")}`,
      );
      return inputs;
    }),
  );

  for (const r of jobInputsResults) {
    if (r.status === "rejected") {
      log(red("[e] Failed:"));
      log(r.reason);
    }
  }

  if (!jobInputsResults.every(it => it.status === "fulfilled")) return;
  const jobInputs = jobInputsResults.map(it => it.value);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const inputs = jobInputs[i];
    await job.build(ctx, inputs);
  }

  const writeResults = await Promise.allSettled(
    ctx.output.entries().map(async ([name, content]) => {
      log(green("[+]") + " " + ctx.destination + "/" + name);
      return await ctx.write(name, content);
    }),
  );

  for (const r of writeResults) {
    if (r.status === "rejected") {
      log(red("[err] Failed:"));
      log(r.reason);
    }
  }
}
