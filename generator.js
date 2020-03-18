const { parse } = require("./parser");
const { macros } = require("./macros");

class Cadey {
  constructor({ parse, macros, rules }) {
    this.macros = macros;
    this.parse = parse;
    this.rules = rules;
  }
  generate(input) {
    const cst = this.parse(input);
    return this.parseCST(cst);
  }
  parseCST(cst) {
    return this.rules[cst.name].call(this, cst);
  }
  addRules(rules) {
    Object.assign(this.rules, rules);
  }
  addMacros(macros) {
    Object.assign(this.macros, macros);
  }
}

const rules = {
  cadey(cst) {
    const { document } = cst;
    return this.parseCST(document);
  },
  document(cst) {
    const { content } = cst;
    return content.map(part => this.parseCST(part)).join("\n");
  },
  block(cst) {
    const { content } = cst;
    const generated = content.map(part => this.parseCST(part)).join("");
    return `<div> ${generated} </div>`;
  },
  macro(cst) {
    const { macro, content } = cst;
    const namedArgs = {};
    const unnamedArgs = [];
    // todo: this should be done for list argument too
    content
      .map(arg => this.parseCST(arg))
      .forEach(arg => {
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
    return this.macros[macro].apply(this, args);
  },
  namedArgument(cst) {
    const { argName, content } = cst;
    const parsedContent = content.map(arg => this.parseCST(arg));
    const value = content.length == 1 ? parsedContent.pop() : parsedContent;
    return Object.fromEntries(new Map([[argName, value]]));
  },
  listArgument(cst) {
    const { content } = cst;
    const generated = content.map(part => this.parseCST(part));
    return generated;
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
  }
};

const Generator = new Cadey({ parse, macros, rules });

const generate = input => Generator.generate(input);

module.exports.generate = generate;
module.exports.rules = rules;
