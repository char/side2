import type { Context, Job } from "@char/ssg";

export default {
  build: async (ctx: Context) => {
    const document = await ctx.readDocument("index.html");
    const div = <div dataset={{ hello: "world" }}>hello, world!</div>;
    document.querySelector("main")!.append(div);
    await ctx.writeDocument("index.html", document);
  },
} satisfies Job;
