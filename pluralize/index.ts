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

const pluralize = (tokens: string[]): string[] => {
  const { NounInflector } = require('natural');
  const nounInflector = new NounInflector();
  return tokens.map((w) => nounInflector.pluralize(w));
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);
    return succeed(context, pluralize(req.body));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
