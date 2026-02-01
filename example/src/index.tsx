import type { Context, Job } from "@char/side2";

export default {
  build: async (ctx: Context) => {
    const document = await ctx.readDocument("index.html");
    const div = <div dataset={{ hello: "world" }}>hello, world!</div>;
    document.querySelector("main")!.append(div);
    ctx.put("index.html", document);
  },
} satisfies Job;
