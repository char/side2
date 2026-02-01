// prettier-ignore
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img",
  "input", "link", "meta", "param", "source", "track", "wbr",
]);

// prettier-ignore
const INLINE_ELEMENTS = new Set([
  "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
  "em", "i", "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp",
  "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr",
]);

const RAW_CONTENT_ELEMENTS = new Set(["style", "script", "pre", "textarea", "template"]);

function escape(v: string) {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function isInline(el: Element) {
  return INLINE_ELEMENTS.has(el.tagName.toLowerCase());
}

function formatAttrs(el: Element) {
  return Array.from(el.attributes)
    .map(a => `${a.name}="${escape(a.value)}"`)
    .join(" ");
}

function formatNode(node: Node, document: Document, indent: number, inline: boolean): string {
  const sp = "  ".repeat(indent);
  const wrap = (s: string) => (inline ? s : `${sp}${s}\n`);

  if (node.nodeType === Node.TEXT_NODE) {
    const t = (node.textContent ?? "").trim();
    return t ? (inline ? t.replace(/\s+/g, " ") : wrap(t)) : "";
  }

  if (node.nodeType === Node.COMMENT_NODE) return wrap(`<!--${node.textContent ?? ""}-->`);

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = formatAttrs(el);
    if (VOID_ELEMENTS.has(tag)) return wrap(attrs ? `<${tag} ${attrs} />` : `<${tag} />`);

    const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
    const close = `</${tag}>`;

    // Preserve raw content for style and script tags
    if (RAW_CONTENT_ELEMENTS.has(tag)) {
      const rawContent = el.textContent ?? "";
      return wrap(`${open}${rawContent}${close}`);
    }

    const children = Array.from(el.childNodes);

    const childrenAllInline =
      inline ||
      isInline(el) ||
      children.every(
        c =>
          c.nodeType === Node.TEXT_NODE ||
          (c.nodeType === Node.ELEMENT_NODE && isInline(c as Element)),
      );

    const content = children
      .map(c => formatNode(c, document, indent + 1, childrenAllInline))
      .join("");

    return childrenAllInline
      ? wrap(`${open}${content.trim()}${close}`)
      : `${sp}${open}\n${content}${sp}${close}\n`;
  }

  return "";
}

export function renderDocument(doc: Document): string {
  const htmlAttrs = formatAttrs(doc.documentElement);
  const head = Array.from(doc.head.childNodes)
    .map(c => formatNode(c, doc, 2, false))
    .join("");
  const body = Array.from(doc.body.childNodes)
    .map(c => formatNode(c, doc, 2, false))
    .join("");
  return `<!DOCTYPE html>
${htmlAttrs ? `<html ${htmlAttrs}>` : `<html>`}
  <head>
    ${head.trim()}
  </head>
  <body>
    ${body.trim()}
  </body>
</html>\n`;
}
