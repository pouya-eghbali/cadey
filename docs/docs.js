const { generate } = require("../generator");
const fs = require("fs");

const template = content => `
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
  </article>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.19.0/plugins/autoloader/prism-autoloader.min.js"></script>
</body>
</html>
`;

["./specs.cadey"].forEach(file => {
  const source = fs.readFileSync(file).toString();
  generate(source)
    .then(template)
    .then(result => fs.writeFileSync(`${file}.html`, result))
    .catch(console.trace);
});