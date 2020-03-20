const patterns = {
  escaped: /^\\./i,
  keyword: /^:[a-z0-9.-]+/i,
  colon: /^:/,
  word: /^[^\[\] \n\r\\]+/,
  bracketLeft: /^\[/,
  bracketRight: /^\]/,
  newline: /^(\n|\n\r)/,
  spaces: / +/
};

const lexer = string => {
  const tokens = [];
  let i = 0;
  while (i < string.length) {
    let matched = false;
    for (let name in patterns) {
      if (patterns.hasOwnProperty(name)) {
        const pattern = patterns[name];
        const match = string.slice(i).match(pattern);
        if (match != null) {
          tokens.push({
            name: name,
            index: i,
            raw: match[0]
          });
          i += match[0].length;
          matched = true;
          break;
        }
      }
    }
    if (!matched) throw new Error(`Lexing error at ${i}`);
  }
  tokens.push({
    name: "newline",
    index: string.length,
    raw: "\n"
  });
  tokens.push({
    name: "eof",
    index: string.length,
    raw: "eof"
  });
  return tokens;
};

module.exports.lexer = lexer;
