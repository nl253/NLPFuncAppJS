import { Context, HttpRequest } from '@azure/functions';

import * as nlp from 'compromise';

import * as schema from './schema';

import {
  fail,
  logStart,
  Response,
  succeed,
  validateJSON,
} from '../lib';

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);
    return succeed(context, nlp(req.body.text).quotations().out('array'));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
