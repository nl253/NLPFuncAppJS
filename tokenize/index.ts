/* eslint-disable global-require,@typescript-eslint/no-var-requires */
import { Context, HttpRequest } from '@azure/functions';
import {
  fail,
  logStart,
  Response,
  succeed,
  validateJSON,
} from '../lib';

import * as schema from './schema';

type Tokenizer = 'RegexpTokenizer'
               | 'AggressiveTokenizer'
               | 'CaseTokenizer'
               | 'OrthographyTokenizer'
               | 'TreebankWordTokenizer'
               | 'WordPunctTokenizer'
               | 'WordTokenizer'
               | 'SentenceTokenizer';
type TokenizeOpts = Partial<{
  tokenizer: Tokenizer;
  regex: string;
  flags: string;
}>;

const tokenize = (txt: string, opts: TokenizeOpts = {}): string[] => {
  const {
    tokenizer = 'WordTokenizer',
    regex = '[a-z0-9]+([-@][a-z0-9])*(\'[a-z]+)?|[:\\&\'"@.,;!?]+',
    flags = 'i',
  } = opts;
  let tokenizerObj;
  if (tokenizer === 'OrthographyTokenizer') {
    const { OrthographyTokenizer } = require('natural');
    tokenizerObj = new OrthographyTokenizer();
  } else if (tokenizer === 'WordTokenizer') {
    const { WordTokenizer } = require('natural');
    tokenizerObj = new WordTokenizer();
  } else if (tokenizer === 'WordPunctTokenizer') {
    const { WordPunctTokenizer } = require('natural');
    tokenizerObj = new WordPunctTokenizer();
  } else if (tokenizer === 'TreebankWordTokenizer') {
    const { TreebankWordTokenizer } = require('natural');
    tokenizerObj = new TreebankWordTokenizer();
  } else if (tokenizer === 'RegexpTokenizer') {
    const { RegexpTokenizer } = require('natural');
    const tOpts = { gaps: false, pattern: new RegExp(regex, `${flags || ''}g`) };
    tokenizerObj = new RegexpTokenizer(tOpts);
  } else {
    throw new Error(`unrecognised tokenizer "${tokenizer}"`);
  }
  return tokenizerObj.tokenize(txt);
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    validateJSON(context, schema);
    const {
      text,
      regex,
      flags,
      tokenizer,
    } = req.body;
    return succeed(context, tokenize(text, { flags, regex, tokenizer }));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
