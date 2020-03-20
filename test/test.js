const { generate } = require("../generator");
const fs = require("fs");
const cadey = fs.readFileSync("./test.cadey").toString();
generate(cadey).then(result => fs.writeFileSync("./test.html", result));
