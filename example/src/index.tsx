import { createJob } from "@char/side2";

export default createJob({ "index.html": "doc" }, (ctx, inputs) => {
  const document = inputs["index.html"];
  ctx.useDocument(document);

  const div = <div dataset={{ hello: "world" }}>hello, world!</div>;
  document.querySelector("main")!.append(div);
  ctx.put("index.html", document);
});
