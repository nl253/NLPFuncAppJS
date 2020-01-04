import { Context, HttpRequest } from '@azure/functions';
import {
  fail, logStart, succeed, validateJSON,
} from '../lib';

import * as schema from './schema';

export default async function (context: Context, req: HttpRequest): Promise<Response> {
  logStart(context);

  try {
    await validateJSON(context, schema);
    const flagSet: Set<string> = new Set(['g'].concat(Array.from(req.body.flags || '')));
    const flags: string = Array.from(flagSet).join('');
    const regex = new RegExp(req.body.regex, flags);
    return succeed(context, regex.exec(req.body.text));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
}
