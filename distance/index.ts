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

type DistanceMetric = 'LevenshteinDistance'
                    | 'DamerauLevenshteinDistance'
                    | 'JaroWinklerDistance'
                    | 'DiceCoefficient';

const distance = (s1: string, s2: string, metric: DistanceMetric = 'LevenshteinDistance'): number => {
  if (metric === 'LevenshteinDistance') {
    return require('natural').LevenshteinDistance(s1, s2);
  }
  if (metric === 'DamerauLevenshteinDistance') {
    return require('natural').DamerauLevenshteinDistance(s1, s2);
  }
  if (metric === 'JaroWinklerDistance') {
    return require('natural').JaroWinklerDistance(s1, s2);
  }
  if (metric === 'DiceCoefficient') {
    return require('natural').DiceCoefficient(s1, s2);
  }
  throw new Error(`unrecognised metric "${metric}"`);
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);

    const { text1, text2, metric } = req.body;
    return succeed(context, distance(text1, text2, metric));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
