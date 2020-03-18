module.exports = `alias whitespace spaces|newline
alias textual word|whitespace|colon|escaped
alias arguments textual|namedArgument|listArgument|macro
alias content textual|macro|namedArgumentKeyword

escaped word => word { raw: left.raw[1] + right.raw }

bracketLeft whitespace => bracketLeft { }
whitespace bracketRight => bracketRight { }

bracketLeft word => macroStart { macro: right.raw, content: [] }
macroStart arguments => macroStart { macro: left.macro, content: [...left.content, right] }
macroStart bracketRight => macro { macro: left.macro, content: left.content }

bracketLeft keyword => namedArgumentStart { argName: right.raw.slice(1), content: [] }
namedArgumentStart arguments => namedArgumentStart { argName: left.argName, content: [...left.content, right] }
namedArgumentStart bracketRight => namedArgument {argName: left.argName, content: left.content }

keyword whitespace => namedArgumentKeyword { argName: left.raw.slice(1) }
namedArgumentKeyword word => namedArgument { argName: left.argName, content: [right] }

bracketLeft colon => listArgumentStart { content: [] }
listArgumentStart arguments => listArgumentStart { content: [...left.content, right] }
listArgumentStart bracketRight => listArgument { content: left.content }

newline newline => linebreak { }

blockStart content => blockStart { content: [...left.content, right] }
content blockStart => blockStart { content: [left, ...right.content] }
content content => blockStart { content: [left, right] }
blockStart linebreak => block { content: left.content }
content linebreak => block { content: [left] }

document whitespace|linebreak => document { content: left.content }
whitespace|linebreak document => document { content: right.content }
block document => document { content: [left, ...right.content]}
document block => document { content: [...left.content, right]}
block block => document { content: [left, right] }

document eof => cadey { document: left }
block eof => cadey { document: { name: "document", content: [left] }}`
