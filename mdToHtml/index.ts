import {lexer, parser, Renderer, setOptions} from 'marked';

import {
  CACHE_HEADER,
  fail,
  HTML_HEADER,
  logStart,
  succeed,
  validateJSON,
} from '../lib';

import * as schema from './schema';

setOptions({
  renderer: new Renderer(),
  highlight: code => require('highlight.js').highlightAuto(code).value,
  pedantic: false,
  gfm: true,
  silent: true,
  headerIds: false,
  mangle: true,
  breaks: true,
  sanitize: false,
  smartLists: true,
  smartypants: true,
  xhtml: false,
});

module.exports = async (context, req) => {
  logStart(context);
  try {
    await validateJSON(context, schema);
    return succeed(context, parser(lexer(req.body)), { ...HTML_HEADER, ...CACHE_HEADER })
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
