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

type SoundALikeOpts = Partial<{
  algorithm: 'SoundEx' | 'Metaphone' | 'DoubleMetaphone';
}>;

const soundalike = (s1: string, s2: string, opts: SoundALikeOpts): boolean => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const { algo = 'SoundEx' } = opts;
  // eslint-disable-next-line security/detect-object-injection
  const f = require('natural')[algo];
  return f.compare(s1, s2);
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);

    const { text1, text2, algorithm } = req.body;
    return succeed(context, soundalike(text1, text2, { algorithm }));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
