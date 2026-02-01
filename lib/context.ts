import * as path from "@std/path";
import { renderDocument } from "./render-document.ts";

export class Context {
  source: string;
  destination: string;

  constructor(opts: { source: string; destination: string }) {
    this.source = opts.source;
    this.destination = opts.destination;
  }

  async readText(name: string): Promise<string> {
    return await Deno.readTextFile(path.join(this.source, name));
  }

  async readBinary(name: string): Promise<Uint8Array> {
    return await Deno.readFile(path.join(this.source, name));
  }

  async readDocument(name: string): Promise<Document> {
    const text = await this.readText(name);
    const doc = new DOMParser().parseFromString(text, "text/html");
    // set the current window.document to this doc so that elements
    // dont have to be document-adopted as much
    Reflect.defineProperty(globalThis, "document", { value: doc });
    return doc;
  }

  async writeDocument(name: string, document: Document): Promise<void> {
    await this.write(name, renderDocument(document));
  }

  // TODO: we probably want to split the lifecycle into some kinda
  // plan-execute situation where jobs' write(..) calls just queue operations
  // to be executed _after all jobs have run_.
  //
  // this means that we can reduce awaits in jobs and also if we encounter an error
  // in the middle of user build jobs we don't end up partially-building the site.
  async write(
    name: string,
    content: string | Uint8Array | ReadableStream<Uint8Array>,
    opts: { mkdirs?: boolean } = {},
  ): Promise<void> {
    const { mkdirs = true } = opts;
    if (mkdirs) {
      try {
        const parent = path.join(this.destination, path.dirname(name));
        await Deno.mkdir(parent, { recursive: true });
      } catch {
        // ignore
      }
    }

    const dest = path.join(this.destination, name);
    if (typeof content === "string") {
      await Deno.writeTextFile(dest, content);
    } else {
      await Deno.writeFile(dest, content);
    }
  }
}
