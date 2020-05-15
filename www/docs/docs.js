const { Generator } = require("../../generator");
const fs = require("fs");

const template = file => content => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/dracula-prism.css" />
  <link rel="stylesheet" href="/css/page.css" />
  <title>Cadey</title>
</head>
<body>
  <article class="page">
    ${content}
    <div>
      Generated by Cadey 0.0.2. View source
      <a href="https://github.com/pouya-eghbali/cadey/blob/master/www/docs/${file}">here</a>.
    </div>
  </article>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/prism.min.js"></script>
  <script src="/js/prism.cadey.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/plugins/autoloader/prism-autoloader.min.js"></script>
</body>
</html>
`;

const asText = arr => {
  if (typeof arr == "string") return arr;
  return arr.map(asText).join("");
};

Generator.addMacros({
  async example(options, ...args) {
    const text = asText(args) + "\n";
    const generated = await Generator.generate(text);
    return `<div class="example"> ${generated} </div>`;
  }
});

const files = ["./specs.cadey", "./learn.cadey", "./macros.cadey"];

files.forEach(file => {
  console.log(`Building ${file}`);
  const source = fs.readFileSync(file).toString();
  Generator.generate(source)
    .then(template(file))
    .then(result => fs.writeFileSync(`${file}.html`, result))
    .catch(console.trace);
});