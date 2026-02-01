import * as linkedom from "linkedom";

for (const [k, v] of Object.entries(linkedom)) {
  if (["parseHTML", "parseJSON", "toJSON"].includes(k)) continue;
  Reflect.defineProperty(globalThis, k, { value: v });
}

const dom = linkedom.parseHTML("<!doctype html>");
for (const [k, v] of Object.entries(dom)) {
  Reflect.defineProperty(globalThis, k, { value: v });
}
