import * as path from "@std/path";
import { renderDocument } from "./render-document.ts";

type Content = string | Document | Uint8Array | ReadableStream<Uint8Array>;
export class Context {
  source: string;
  destination: string;

  output = new Map<string, Content>();

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
    return doc;
  }

  useDocument(doc: Document): void {
    // set the current window.document to this doc so that
    // document.createElement doesnt make nodes that need to be readopted
    Reflect.defineProperty(globalThis, "document", { value: doc });
  }

  put(name: string, content: Content): void {
    this.output.set(name, content);
  }

  async write(name: string, content: Content, opts: { mkdirs?: boolean } = {}): Promise<void> {
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
    } else if (content instanceof Document) {
      await Deno.writeTextFile(dest, renderDocument(content));
    } else {
      await Deno.writeFile(dest, content);
    }
  }
}
