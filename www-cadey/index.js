import "./index.styl";
import "./dracula-prism.css";

import cadey from "../cadey/index";
import Undyne from "undyne";

class CadeyEditor extends Undyne {
  tokenize() {
    this.colorMap = this.colorMap || {};
    const getColor = type => {
      if (!this.colorMap[type]) {
        const el = document.createElement("span");
        el.innerText = "Cadey";
        el.classList.add("token", type);
        document.body.appendChild(el);
        const { color } = window.getComputedStyle(el);
        el.remove();
        this.colorMap[type] = color;
      }
      return this.colorMap[type];
    };
    const lines = this.getLines().map(line =>
      line.split(/(?<=[ \[\]])|(?=[ \[\]])/)
    );
    const result = [];
    let expectCommand = false;
    let expectKeyword = 0;
    let doEscape = false;
    for (const line of lines) {
      const tokens = [];
      for (const content of line) {
        if (expectCommand && !content.startsWith(":")) {
          tokens.push({ content, color: getColor("function") });
        } else if (expectKeyword && content.startsWith(":")) {
          tokens.push({ content, color: getColor("keyword") });
        } else {
          tokens.push({ content });
        }
        if (!doEscape && !content.match(/\s/)) {
          expectCommand = content == "[";
          if (content == "]") {
            expectKeyword--;
          } else if (content == "[") {
            expectKeyword++;
          }
        }
        doEscape = content == "\\";
      }
      result.push(tokens);
    }
    return result;
  }
}

const editor = new CadeyEditor(document.getElementById("editor"));
editor.content = `[heading :size 1 Cadey]

This is [bold Cadey].
[italic [bold Cadey] is a markup language].

Unlike Markdown, [bold Cadey]
can be parsed with a real parser.
[bold Cadey] has a well-defined
[link https://cadey.io/specs specification].

[bold Cadey] has features that cannot
be found in Markdown.

[list :type ordered
  [: A list of fruits:
       [list Apples Oranges]
     Can you do this in Markdown?]
  [: Just another item] 
]

Here's a random image!

[image https://picsum.photos/340/150]
`;

const preview = () => {
  const { content } = editor;
  try {
    const generated = cadey(content);
    document.getElementById("live-preview").innerHTML = generated;
    document.getElementById("error").innerText = "";
    document.getElementById("error").style.display = "none";
  } catch (error) {
    document.getElementById("error").innerText = error;
    document.getElementById("error").style.display = "block";
  }
};

preview();

document.getElementById("error").style.display = "none";
editor.canvas.addEventListener("keydown", event => preview());
