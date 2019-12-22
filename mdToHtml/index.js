const { lexer, parser, Renderer, setOptions } = require('marked');

const {
  logStart,
  fail,
  succeed,
  validateJSON,
  HTML_HEADER,
  CACHE_HEADER,
} = require('../lib');

setOptions({
  renderer: new Renderer(),
  highlight: function(code) {
    return require('highlight.js').highlightAuto(code).value;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: true,
  xhtml: false,
});

module.exports = async (context, req) => {
  logStart(context);
  try {
    await validateJSON(context, {
      $id: __dirname,
      type: "string",
    });
    return succeed(context, parser(lexer(req.body)), { ...HTML_HEADER, ...CACHE_HEADER })
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
