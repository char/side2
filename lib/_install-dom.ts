import * as dom from "@b-fuze/deno-dom";

for (const [k, v] of Object.entries(dom)) {
  Reflect.defineProperty(globalThis, k, { value: v });
}

const document = new dom.Document();
Reflect.defineProperty(globalThis, "document", { value: document });
