const { parse } = require("./parser");
const { macros } = require("./macros");

class Cadey {
  constructor({ parse, macros, rules }) {
    this.macros = macros;
    this.parse = parse;
    this.rules = rules;
  }
  async generate(input) {
    const cst = this.parse(input);
    return await this.parseCST(cst, this.getContext());
  }
  getContext() {
    return { cadey: this };
  }
  async parseCST(cst, context) {
    return await this.rules[cst.name].call(this, cst, context);
  }
  addRules(rules) {
    Object.assign(this.rules, rules);
  }
  addMacros(macros) {
    Object.assign(this.macros, macros);
  }
}

const rules = {
  async cadey(cst, context) {
    const { document } = cst;
    return await this.parseCST(document, context);
  },
  async document(cst, context) {
    const { content } = cst;
    const document = [];
    for (const block of content)
      document.push(await this.parseCST(block, context));
    return document.join("\n");
  },
  async block(cst, context) {
    const { content } = cst;
    const promisses = content.map(part => this.parseCST(part, context));
    const resolved = await Promise.all(promisses);
    const generated = resolved.join("");
    return `<div> ${generated} </div>`;
  },
  async macro(cst, context) {
    const { macro, content } = cst;
    const namedArgs = {};
    const unnamedArgs = [];
    // todo: this should be done for list argument too
    const promisses = content.map(arg => this.parseCST(arg, context));
    const resolved = await Promise.all(promisses);
    resolved.forEach(arg => {
      if (typeof arg == "string") unnamedArgs.push(arg);
      else if (Array.isArray(arg)) unnamedArgs.push(arg);
      else {
        for (const key in arg) {
          if (key in namedArgs) namedArgs[key].push(arg[key]);
          else namedArgs[key] = [arg[key]];
        }
      }
    });
    for (const key in namedArgs)
      if (namedArgs[key].length == 1) namedArgs[key] = namedArgs[key][0];
    const args = [namedArgs, ...unnamedArgs];
    if (!this.macros[macro])
      throw new Error(`Macro "${macro}" isn't recognized.`);
    const result = await this.macros[macro].apply(context, args);
    return result;
  },
  async namedArgument(cst, context) {
    const { argName, content } = cst;
    const promisses = content.map(arg => this.parseCST(arg, context));
    const parsedContent = await Promise.all(promisses);
    const value = content.length == 1 ? parsedContent.pop() : parsedContent;
    return Object.fromEntries(new Map([[argName, value]]));
  },
  async listArgument(cst, context) {
    const { content, raw } = cst;
    if (raw.endsWith(":]"))
      return [
        content
          .map(({ name, raw }) => (name == "escaped" ? raw.slice(1) : raw))
          .join("")
          .replace(/:\s*$/, "")
      ];
    const generated = content.map(part => this.parseCST(part, context));
    return await Promise.all(generated);
  },
  namedArgumentKeyword(cst) {
    const { argName } = cst;
    return `:${argName} `;
  },
  word(cst) {
    return cst.raw;
  },
  spaces(cst) {
    return cst.raw;
  },
  newline() {
    return "\n";
  },
  escaped(cst) {
    return cst.raw[1];
  },
  escapedList(cst) {
    return cst.raw.replace(/\\(.)/g, "\1");
  },
  colon() {
    return ":";
  }
};

const Generator = new Cadey({ parse, macros, rules });
const generate = input => Generator.generate(input);

module.exports.generate = generate;
module.exports.rules = rules;
