Prism.languages.cadey = {
  parameter: {
    pattern: /(\[[^\]]+?)(?<!\\):[a-z0-9_-]+/i,
    lookbehind: true
  },
  function: {
    pattern: /((?<!\\\[)(?<!\[:.*?)\[)[a-z0-9_-]+/i,
    lookbehind: true
  },
  utl: {
    pattern: /(https?|s?ftp|file):\/\/[^ \]\[]+/i
  }
};
