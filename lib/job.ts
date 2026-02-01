import { expandGlob } from "@std/fs";
import { join } from "@std/path";
import type { Context } from "./context.ts";

export type JobInputsDecl = Record<string, "bin" | "text" | "doc">;
// prettier-ignore
export type JobInputs<I extends JobInputsDecl> = {
  [K in keyof I]:
      I[K] extends "bin" ? Uint8Array
    : I[K] extends "text" ? string
    : I[K] extends "doc" ? Document
    : never;
};
export async function collectJobInputs(
  ctx: Context,
  job: Job,
): Promise<JobInputs<JobInputsDecl>> {
  const convert = async ([name, type]: [string, "bin" | "text" | "doc"]) => {
    switch (type) {
      case "bin":
        return [name, await ctx.readBinary(name)];
      case "text":
        return [name, await ctx.readText(name)];
      case "doc":
        return [name, await ctx.readDocument(name)];
    }
  };
  const inputs = Object.fromEntries(await Promise.all(Object.entries(job.inputs).map(convert)));
  return inputs;
}

export interface Job<I extends JobInputsDecl = JobInputsDecl> {
  inputs: I;
  build: (ctx: Context, inputs: JobInputs<I>) => Promise<void> | void;
}

export function createJob<const I extends JobInputsDecl>(
  inputs: I,
  build: Job<I>["build"],
): Job<I> {
  return { inputs, build };
}

export async function collectJobs(ctx: Context, glob: string = "**/*.tsx"): Promise<Job[]> {
  const jobsImporting: Promise<Job>[] = [];
  for await (const entry of expandGlob(join(ctx.source, glob), { followSymlinks: true })) {
    if (entry.isDirectory) continue;
    jobsImporting.push(import(entry.path).then(m => m.default));
  }
  return await Promise.all(jobsImporting);
}
