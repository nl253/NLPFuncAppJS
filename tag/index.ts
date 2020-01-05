/* eslint-disable global-require,@typescript-eslint/no-var-requires */
import { Context, HttpRequest } from '@azure/functions';
import {
  APIError,
  fail,
  logStart,
  Response,
  succeed,
  validateJSON,
} from '../lib';

import * as schema from './schema';

type TagOpts = Partial<{
  language: string;
  defaultCategory: string;
  defaultCategoryCapitalized: string;
}>;


const posTag = (tokens: string[], tagOpts: TagOpts = {}): string[] => {
  const { BrillPOSTagger, Lexicon, RuleSet } = require('natural');
  const {
    language = 'EN',
    defaultCategory = 'N',
    defaultCategoryCapitalized = 'NNP',
  } = tagOpts;
  const lexicon = new Lexicon(language, defaultCategory, defaultCategoryCapitalized);
  const ruleSet = new RuleSet(language);
  const tagger = new BrillPOSTagger(lexicon, ruleSet);
  return tagger.tag(tokens).taggedWords.map(({ tag }) => tag);
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);
    const {
      tokens,
      language,
      defaultCategory,
      defaultCategoryCapitalized,
    } = req.body;
    const tagOpts = { defaultCategory, defaultCategoryCapitalized, language };
    return succeed(context, posTag(tokens, tagOpts));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
