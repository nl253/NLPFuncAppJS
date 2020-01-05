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

const match = (s1: string, s2: string): { substring: string; distance: number } => {
  const { LevenshteinDistance } = require('natural');
  return LevenshteinDistance(s1, s2, { search: true });
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);

    const { text1, text2 } = req.body;
    return succeed(context, match(text1, text2));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
