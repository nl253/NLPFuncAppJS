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

type SentimentOpts = Partial<{
  vocabulary: 'afinn' | 'senticon' | 'pattern';
  language: string;
}>;

const sentiment = (tokens: string[], sentimentOpts: SentimentOpts = {}): number => {
  const { SentimentAnalyzer } = require('natural');
  const { vocabulary = 'afinn', language = 'English' } = sentimentOpts;
  const analyzer = new SentimentAnalyzer(language, null, vocabulary);
  return analyzer.getSentiment(tokens);
};


export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);
    const { tokens, vocabulary } = req.body;
    const sentimentOpts = { vocabulary };
    return succeed(context, sentiment(tokens, sentimentOpts));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
