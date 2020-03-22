Prism.languages.cadey = {
  property: [
    {
      pattern: /(\[:[a-z0-9_-]+ +)[^\[\]]+/i,
      lookbehind: true
    },
    {
      pattern: /((?<!\\):[a-z0-9_-]+ +)[a-z0-9_-]+/i,
      lookbehind: true
    }
  ],
  keyword: {
    pattern: /(?<!\\):[a-z0-9_-]+/i,
    lookbehind: false
  },
  function: {
    pattern: /((?<!\\\[)(?<!\[:.*?)\[)[a-z0-9_-]+/i,
    lookbehind: true
  },
  utl: {
    pattern: /(https?|s?ftp|file):\/\/[^ \]\[]+/i
  }
};
