/* eslint-disable global-require,@typescript-eslint/no-var-requires */
import { Context, HttpRequest } from '@azure/functions';
import {
  APIError,
  fail, logStart, Response, succeed, validateJSON,
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
type SentimentOpts = Partial<{
  vocabulary: 'afinn' | 'senticon' | 'pattern';
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

const stem = (word: string, stemmer: Stemmer = 'PorterStemmer'): string => {
  switch (stemmer) {
    case 'LancasterStemmer': {
      const { LancasterStemmer } = require('natural');
      return LancasterStemmer.stem(word);
    }
    case 'PorterStemmer': {
      const { PorterStemmer } = require('natural');
      return PorterStemmer.stem(word);
    }
    default: {
      throw new Error(`unrecognised stemmer "${stemmer}"`);
    }
  }
};

const sentiment = (
  txt: string,
  stemmer: Stemmer = 'PorterStemmer',
  tokenizerOpts: TokenizeOpts = {},
  sentimentOpts: SentimentOpts = {},
): number => {
  const { SentimentAnalyzer, ...api } = require('natural');
  const { vocabulary = 'afinn' } = sentimentOpts;
  let analyzer;
  if (stemmer === 'LancasterStemmer') {
    analyzer = new SentimentAnalyzer('English', api.LancasterStemmer, vocabulary);
  } else if (stemmer === 'PorterStemmer') {
    analyzer = new SentimentAnalyzer('English', api.PorterStemmer, vocabulary);
  } else {
    throw new Error(`unrecognised stemmer "${stemmer}"`);
  }
  return analyzer.getSentiment(tokenize(txt, tokenizerOpts));
};

const tokenizeAndStem = (
  txt: string,
  stemmer: Stemmer = 'PorterStemmer',
  tokenizerOpts: TokenizeOpts = {},
): string[] => {
  const tokens = tokenize(txt, tokenizerOpts);
  let stemmerObj;
  if (stemmer === 'PorterStemmer') {
    stemmerObj = require('natural').PorterStemmer;
  } else if (stemmer === 'LancasterStemmer') {
    stemmerObj = require('natural').LancasterStemmer;
  } else {
    throw new Error(`unrecognised stemmer "${stemmer}"`);
  }
  return tokens.map((w) => stemmerObj.stem(w));
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
      case 'stem': {
        const { text, stemmer } = req.body;
        return succeed(context, stem(text, stemmer));
      }
      case 'match': {
        const { text1, text2 } = req.body;
        return succeed(context, match(text1, text2));
      }
      case 'distance': {
        const { text1, text2, metric } = req.body;
        return succeed(context, distance(text1, text2, metric));
      }
      case 'sentiment': {
        const {
          text,
          regex,
          flags,
          vocabulary,
          tokenizer,
        } = req.body;
        return succeed(context, sentiment(text, 'PorterStemmer', { flags, regex, tokenizer }, { vocabulary }));
      }
      case 'tokenizeAndStem': {
        const {
          stemmer,
          text,
          regex,
          flags,
          tokenizer,
        } = req.body;
        return succeed(context, tokenizeAndStem(text, stemmer, { regex, tokenizer, flags }));
      }
      default:
        throw new APIError(`unrecognised action "${req.body.action}"`);
    }
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
