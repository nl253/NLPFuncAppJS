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


const ngrams = (
  input: string | string[],
  n = 2,
): Array<Array<string>> => require('natural').NGrams.ngrams(input, n);


export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);

    const { text, tokens, n } = req.body;
    return succeed(context, ngrams(tokens || text, n));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
