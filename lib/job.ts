import { expandGlob } from "@std/fs";
import { join } from "@std/path";
import type { Context } from "./context.ts";

export interface Job {
  build: (ctx: Context) => Promise<void>;
}

export async function collectJobs(ctx: Context, glob: string = "**/*.tsx"): Promise<Job[]> {
  const jobsImporting: Promise<Job>[] = [];
  for await (const entry of expandGlob(join(ctx.source, glob), { followSymlinks: true })) {
    if (entry.isDirectory) continue;
    jobsImporting.push(import(entry.path).then(m => m.default));
  }
  return await Promise.all(jobsImporting);
}
