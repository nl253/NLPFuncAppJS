import {
  lexer, parser, Renderer, setOptions,
} from 'marked';

import { Context, HttpRequest } from '@azure/functions';
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
  breaks: true,
  gfm: true,
  headerIds: false,
  // eslint-disable-next-line global-require
  highlight: (code) => require('highlight.js').highlightAuto(code).value,
  mangle: true,
  pedantic: false,
  renderer: new Renderer(),
  sanitize: false,
  silent: true,
  smartLists: true,
  smartypants: true,
  xhtml: false,
});

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);
  try {
    await validateJSON(context, schema);
    return succeed(context, parser(lexer(req.body)), { ...HTML_HEADER, ...CACHE_HEADER });
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
