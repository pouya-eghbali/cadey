const { bean, beef } = require("bean-parser");
const { lexer } = require("./lexer");

const modelData = require("./cadey.beef");
const helpers = {};
const model = beef(modelData, helpers);

const parse = source => {
  const tokens = lexer(source);
  const [success, result] = bean(model, tokens);
  if (success) {
    const cst = result[0];
    return cst;
  } else {
    console.dir(result, { depth: null });
    const firstUnmatched = result[0].name;
    const expecting = model
      .filter(m => m.left == firstUnmatched)
      .map(({ right }) => right);
    const encountered = result[1].name;
    const ParsingError = `Expecting one of ${expecting.join(
      ", "
    )} but encountered ${encountered}`;
    throw ParsingError;
  }
};

module.exports.parse = parse;
module.exports.model = model;
