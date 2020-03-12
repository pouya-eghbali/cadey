const { generate } = require("../generator");
const fs = require("fs");
const cadey = fs.readFileSync("./test.cadey").toString();
const result = generate(cadey);
fs.writeFileSync("./test.html", result);
