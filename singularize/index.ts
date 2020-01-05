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


const singularize = (tokens: string[]): string[] => {
  const { NounInflector } = require('natural');
  const nounInflector = new NounInflector();
  return tokens.map((w) => nounInflector.singularize(w));
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);
    return succeed(context, singularize(req.body.tokens));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
