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

type Stemmer = 'PorterStemmer' | 'LancasterStemmer';
type Tokenizer = 'RegexpTokenizer'
               | 'AggressiveTokenizer'
               | 'CaseTokenizer'
               | 'OrthographyTokenizer'
               | 'TreebankWordTokenizer'
               | 'WordPunctTokenizer'
               | 'WordTokenizer'
               | 'SentenceTokenizer';
type DistanceMetric = 'LevenshteinDistance'
                    | 'DamerauLevenshteinDistance'
                    | 'JaroWinklerDistance'
                    | 'DiceCoefficient';
type TokenizeOpts = Partial<{
  tokenizer: Tokenizer;
  regex: string;
  flags: string;
}>;
type SoundALikeOpts = Partial<{
  algorithm: 'SoundEx' | 'Metaphone' | 'DoubleMetaphone';
}>;
type SentimentOpts = Partial<{
  vocabulary: 'afinn' | 'senticon' | 'pattern';
  language: string;
}>;
type TagOpts = Partial<{
  language: string;
  defaultCategory: string;
  defaultCategoryCapitalized: string;
}>;

const tokenize = (txt: string, opts: TokenizeOpts = {}): string[] => {
  const {
    tokenizer = 'WordTokenizer',
    regex = '[a-z0-9]+([-@][a-z0-9])*|[:\\&\'"@.,;!?]+',
    flags = 'i',
  } = opts;
  let tokenizerObj;
  if (tokenizer === 'OrthographyTokenizer') {
    const { OrthographyTokenizer } = require('natural');
    tokenizerObj = new OrthographyTokenizer();
  } else if (tokenizer === 'WordTokenizer') {
    const { WordTokenizer } = require('natural');
    tokenizerObj = new WordTokenizer();
  } else if (tokenizer === 'WordPunctTokenizer') {
    const { WordPunctTokenizer } = require('natural');
    tokenizerObj = new WordPunctTokenizer();
  } else if (tokenizer === 'TreebankWordTokenizer') {
    const { TreebankWordTokenizer } = require('natural');
    tokenizerObj = new TreebankWordTokenizer();
  } else if (tokenizer === 'RegexpTokenizer') {
    const { RegexpTokenizer } = require('natural');
    const tOpts = { gaps: false, pattern: new RegExp(regex, `${flags || ''}g`) };
    tokenizerObj = new RegexpTokenizer(tOpts);
  } else {
    throw new Error(`unrecognised tokenizer "${tokenizer}"`);
  }
  return tokenizerObj.tokenize(txt);
};

const stem = (tokens: string[], stemmer: Stemmer = 'PorterStemmer'): string[] => {
  let stemmerObj;
  if (stemmer === 'LancasterStemmer') {
    stemmerObj = require('natural').LancasterStemmer;
  } else if (stemmer === 'PorterStemmer') {
    stemmerObj = require('natural').PorterStemmer;
  } else {
    throw new Error(`unrecognised stemmer "${stemmer}"`);
  }
  return tokens.map((w) => stemmerObj.stem(w));
};

const sentiment = (tokens: string[], sentimentOpts: SentimentOpts = {}): number => {
  const { SentimentAnalyzer } = require('natural');
  const { vocabulary = 'afinn', language = 'English' } = sentimentOpts;
  const analyzer = new SentimentAnalyzer(language, null, vocabulary);
  return analyzer.getSentiment(tokens);
};

const tag = (tokens: string[], tagOpts: TagOpts = {}): string[] => {
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

const match = (s1: string, s2: string): { substring: string; distance: number } => {
  const { LevenshteinDistance } = require('natural');
  return LevenshteinDistance(s1, s2, { search: true });
};

const ngrams = (
  input: string | string[],
  n = 2,
): Array<Array<string>> => require('natural').NGrams.ngrams(input, n);

const pluralize = (tokens: string[]): string[] => {
  const { NounInflector } = require('natural');
  const nounInflector = new NounInflector();
  return tokens.map((w) => nounInflector.pluralize(w));
};

const singularize = (tokens: string[]): string[] => {
  const { NounInflector } = require('natural');
  const nounInflector = new NounInflector();
  return tokens.map((w) => nounInflector.singularize(w));
};

const soundalike = (s1: string, s2: string, opts: SoundALikeOpts): boolean => {
  const { algo = 'SoundEx' } = opts;
  const f = require('natural')[algo];
  return f.compare(s1, s2);
};


export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);

    switch (req.body.action) {
      case 'tokenize': {
        const {
          text,
          regex,
          flags,
          tokenizer,
        } = req.body;
        return succeed(context, tokenize(text, { flags, regex, tokenizer }));
      }
      case 'pluralize':
        return succeed(context, pluralize(req.body.tokens));
      case 'singularize':
        return succeed(context, singularize(req.body.tokens));
      case 'stem': {
        const { tokens, stemmer } = req.body;
        return succeed(context, stem(tokens, stemmer));
      }
      case 'ngrams': {
        const { text, tokens, n } = req.body;
        return succeed(context, ngrams(tokens || text, n));
      }
      case 'match': {
        const { text1, text2 } = req.body;
        return succeed(context, match(text1, text2));
      }
      case 'soundalike': {
        const { text1, text2, algorithm } = req.body;
        return succeed(context, soundalike(text1, text2, { algorithm }));
      }
      case 'tag': {
        const {
          tokens,
          language,
          defaultCategory,
          defaultCategoryCapitalized,
        } = req.body;
        const tagOpts = { defaultCategory, defaultCategoryCapitalized, language };
        return succeed(context, tag(tokens, tagOpts));
      }
      case 'distance': {
        const { text1, text2, metric } = req.body;
        return succeed(context, distance(text1, text2, metric));
      }
      case 'sentiment': {
        const { tokens, vocabulary } = req.body;
        const sentimentOpts = { vocabulary };
        return succeed(context, sentiment(tokens, sentimentOpts));
      }
      default:
        throw new APIError(`unrecognised action "${req.body.action}"`);
    }
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
