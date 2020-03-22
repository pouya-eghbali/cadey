const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const readFromFs = src =>
  fs.readFileSync(path.join(process.cwd(), src)).toString();

const fetchFile = async src => {
  if (src.startsWith(".")) {
    const { origin } = location;
    const pathname = location.pathname.replace(/[^/]+$/, "");
    src = origin + pathname + src;
  }
  src = src.replace(/\/\.\//g, "/").replace(/([^/]+)\/\.\.\//, "\1/");
  const resp = await fetch(src);
  return await resp.text();
};

const isNode = typeof window != undefined;
const readFile = isNode ? readFromFs : fetchFile;

const getLang = src => {
  const info = mime.lookup(src);
  return info ? info.split("/").pop() : info;
};

const cellValue = cell => {
  if (Array.isArray(cell)) return cell.join("").trim();
  return cell;
};

const unArray = arr => {
  if (Array.isArray(arr)) {
    if (arr.filter(removeWhites).filter(Boolean).length)
      return arr.map(unArray).join("");
    return `<span></span>`;
  }
  return arr;
};
const joinWords = cells => cells.map(unArray).reduce(wordJoiner, []);

const wordJoiner = (joined, word) => {
  if (isWhite(word)) joined.push(word);
  else joined[joined.length - 1] += word;
  return joined;
};

const isWhite = str => str.match(/^\s+$/);
const removeWhites = cell => typeof cell != "string" || !isWhite(cell);
const cleanCells = cells => joinWords(cells).filter(removeWhites);
const makeCell = (type, cell) => `<${type}> ${cellValue(cell)} </${type}>`;

const makeMultipleCells = (type, cells) =>
  cleanCells(cells)
    .map(cell => makeCell(type, cell))
    .join("\n");

const asText = arr => {
  if (typeof arr == "string") return arr;
  return arr
    .map(asText)
    .join("")
    .trim();
};

const macros = {
  heading(options, ...args) {
    const { size } = options;
    return `<h${size}>${asText(args)}</h${size}>`;
  },
  bold(options, ...args) {
    return `<b> ${asText(args)} </b>`;
  },
  italic(options, ...args) {
    return `<i> ${asText(args)} </i>`;
  },
  strike(options, ...args) {
    return `<del> ${args.join("")} </del>`;
  },
  image(options, ...args) {
    const { width, height } = options;
    const [src, alt = ""] = args.filter(arg => !arg.match(/^\s+$/));
    const atts = [];
    if (width) atts.push(`width="${width}px"`);
    if (height) atts.push(`height="${height}px"`);
    atts.push(`src="${src}"`);
    if (options.alt) atts.push(`alt="${asText(options.alt)}"`);
    else if (alt) atts.push(`alt="${alt.join(" ")}"`);
    return `
      <span class="image-container">
        <img ${atts.join("")}>
      </span>
    `;
  },
  link(options, ...args) {
    const [href, ...text] = args.filter(arg => !arg.match(/^ +$/));
    return `<a href="${href}">${text.join(" ")}</a>`;
  },
  table(options, ...args) {
    const { row, header } = options;
    const thead = header
      ? "<tr>" + makeMultipleCells("th", header) + "</tr>"
      : "";
    const tbody = Array.isArray(row[0])
      ? row
          .map(cells => makeMultipleCells("td", cells))
          .map(cells => `<tr> ${cells} </tr>`)
          .join("\n")
      : "<tr>" + makeMultipleCells("td", row) + "</tr>";
    return `
      <table>
        <thead> ${thead} </thead>
        <tbody> ${tbody} </tbody>
      </table>
    `;
  },
  list(options, ...args) {
    const { type = "unordered" } = options;
    const items = args
      .filter(arg => typeof arg != "string" || !arg.match(/^[ \n]+$/))
      .map(arg => (Array.isArray(arg) ? arg.join("") : arg))
      .map(item => item.split(/\n\s*?\n/g))
      .map(item => item.filter(removeWhites))
      .map(item => item.map(line => `<div> ${line} </div>`))
      .map(item => item.join("\n"))
      .map(item => `<li> ${item} </li>`)
      .join("\n");
    const el = type == "ordered" ? "ol" : "ul";
    return `<${el}> ${items} </${el}>`;
  },
  async code(options, ...args) {
    const { language, content } = options;
    const code = content
      ? await readFile(content.join("").trim())
      : args.join("").trim();
    const getLangName = () => getLang(content.join("").trim());
    const langCode = language || (content ? getLangName() : "");
    const classList = langCode ? `lang-${langCode}` : "";
    const multiline = code.includes("\n");
    const codeBlock = `<code class="${classList}">${code}</code>`;
    return multiline ? `<pre>${codeBlock}</pre>` : codeBlock;
  },
  quote(options, ...args) {
    const { author } = options;
    return `<blockquote> ${args.join("")} </blockquote>`;
  },
  set(options, ...args) {
    const [name, ...rest] = args.slice(1);
    this.context = this.context || {};
    this.context[name] = rest.slice(1);
    return "";
  },
  get(options, ...args) {
    const [name] = args.filter(removeWhites);
    this.context = this.context || {};
    return this.context[name];
  }
};

module.exports.macros = macros;
