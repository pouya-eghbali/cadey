module.exports = `alias whitespace spaces|newline
alias textual word|whitespace|colon|escaped
alias arguments textual|namedArgument|listArgument|macro
alias content textual|macro|namedArgumentKeyword

bracketLeft whitespace => bracketLeft { raw: left.raw + right.raw }
whitespace bracketRight => bracketRight { raw: left.raw + right.raw }

bracketLeft word => macroStart { macro: right.raw, content: [], raw: left.raw + right.raw }
macroStart arguments => macroStart { macro: left.macro, content: [...left.content, right], raw: left.raw + right.raw }
macroStart bracketRight => macro { macro: left.macro, content: left.content, raw: left.raw + right.raw }

bracketLeft keyword => namedArgumentStart { argName: right.raw.slice(1), content: [], raw: left.raw + right.raw }
namedArgumentStart arguments => namedArgumentStart { argName: left.argName, content: [...left.content, right], raw: left.raw + right.raw }
namedArgumentStart bracketRight => namedArgument {argName: left.argName, content: left.content, raw: left.raw + right.raw }

keyword whitespace => namedArgumentKeyword { argName: left.raw.slice(1), raw: left.raw + right.raw }
namedArgumentKeyword word => namedArgument { argName: left.argName, content: [right], raw: left.raw + right.raw }

bracketLeft colon => listArgumentStart { content: [], raw: left.raw + right.raw }
listArgumentStart arguments => listArgumentStart { content: [...left.content, right], raw: left.raw + right.raw }
listArgumentStart bracketRight => listArgument { content: left.content, raw: left.raw + right.raw }

newline newline => linebreak { raw: left.raw + right.raw }

blockStart content => blockStart { content: [...left.content, right], raw: left.raw + right.raw }
content blockStart => blockStart { content: [left, ...right.content], raw: left.raw + right.raw }
content content => blockStart { content: [left, right], raw: left.raw + right.raw }
blockStart linebreak => block { content: left.content, raw: left.raw + right.raw }
content linebreak => block { content: [left], raw: left.raw + right.raw }

document whitespace|linebreak => document { content: left.content, raw: left.raw + right.raw }
whitespace|linebreak document => document { content: right.content, raw: left.raw + right.raw }
block document => document { content: [left, ...right.content], raw: left.raw + right.raw }
document block => document { content: [...left.content, right], raw: left.raw + right.raw }
block block => document { content: [left, right], raw: left.raw + right.raw }

document eof => cadey { document: left, raw: left.raw + right.raw }
block eof => cadey { document: { name: "document", content: [left], raw: left.raw + right.raw }}`
