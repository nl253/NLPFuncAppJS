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

type Stemmer = 'PorterStemmer' | 'LancasterStemmer';

const stem = (tokens: string[], stemmer: Stemmer = 'PorterStemmer'): string[] => {
  let stemmerObj;
  if (stemmer === 'LancasterStemmer') {
    stemmerObj = require('natural').LancasterStemmer;
  } else if (stemmer === 'PorterStemmer') {
    stemmerObj = require('natural').PorterStemmer;
  } else {
    throw new Error(`unrecognised stemmer "${stemmer}"`);
  }
  return tokens.map((w) => stemmerObj.stem(w));
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);

    const { tokens, stemmer } = req.body;
    return succeed(context, stem(tokens, stemmer));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
