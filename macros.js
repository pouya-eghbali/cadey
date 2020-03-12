const macros = {
  header(options, ...args) {
    const { size } = options;
    return `<h${size}> ${args.join("")} </h${size}>`;
  },
  bold(options, ...args) {
    return `<b> ${args.join("")} </b>`;
  },
  italic(options, ...args) {
    return `<i> ${args.join("")} </i>`;
  },
  strike(options, ...args) {
    return `<del> ${args.join("")} </del>`;
  },
  image(options, ...args) {
    const { width, height } = options;
    const [src, alt] = args.filter(arg => !arg.match(/^ +$/));
    const atts = [];
    if (width) atts.push(`width="${width}px"`);
    if (height) atts.push(`width="${height}px"`);
    atts.push(`src="${src}"`);
    if (alt) atts.push(`alt="${alt}"`);
    return `<img ${atts.join("")}>`;
  },
  link(options, ...args) {
    const [href, text] = args.filter(arg => !arg.match(/^ +$/));
    return `<a href="${href}"> ${text} </a>`;
  },
  table(options, ...args) {
    const { row, header } = options;
    const thead = header
      ? "<tr>" + header.map(cell => `<th> ${cell} </th>`).join("\n") + "</tr>"
      : "";
    const tbody = row
      .map(r => r.map(cell => `<td> ${cell} </td>`).join("\n"))
      .map(r => `<tr> ${r} </tr>`)
      .join("\n");
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
      .map(item => `<li> ${item} </li>`)
      .join("\n");
    const el = type == "ordered" ? "ol" : "ul";
    return `<${el}> ${items} </${el}>`;
  },
  code(options, ...args) {
    const { language } = options;
    const code = args.join("").trim();
    return `<pre><code class="lang-${language}">${code}</code></pre>`;
  },
  quote(options, ...args) {
    const { author } = options;
    return `<blockquote> ${args.join("")} </blockquote>`;
  }
};

module.exports.macros = macros;
