import { job } from "@char/side2";

export default job({ "index.html": "doc" }, (ctx, inputs) => {
  const document = inputs["index.html"];
  ctx.useDocument(document);

  const div = (
    <div dataset={{ hello: "world" }}>
      hello, world!
      <input type="text" value="hello" />
    </div>
  );
  document.querySelector("main")!.append(div);
  ctx.put("index.html", document);
});
