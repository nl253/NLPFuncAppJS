/* eslint-disable @typescript-eslint/no-var-requires,max-len,global-require,no-case-declarations */
import { Context, HttpRequest } from '@azure/functions';
import {
  fail, logStart, Response, succeed, validateJSON,
} from '../lib';

import * as schema from './schema';

type Stemmer = 'PorterStemmer' | 'LancasterStemmer';
type Tokenizer = 'OrthographyTokenizer' | 'WordPunctTokenizer' | 'WordTokenizer' | 'TreebankWordTokenizer';
type DistanceMetric = 'LevenshteinDistance' | 'DamerauLevenshteinDistance' | 'JaroWinklerDistance' | 'DiceCoefficient';

const tokenize = (txt: string, tokenizer: Tokenizer = 'WordTokenizer'): string[] => {
  const {
    TreebankWordTokenizer,
    OrthographyTokenizer,
    WordPunctTokenizer,
    WordTokenizer,
  } = require('natural');
  switch (tokenizer) {
    case 'OrthographyTokenizer':
      return new OrthographyTokenizer().tokenize(txt);
    case 'WordTokenizer':
      return new WordTokenizer().tokenize(txt);
    case 'WordPunctTokenizer':
      return new WordPunctTokenizer().tokenize(txt);
    case 'TreebankWordTokenizer':
      return new TreebankWordTokenizer().tokenize(txt);
    default: {
      throw new Error(`unrecognised tokenizer "${tokenizer}"`);
    }
  }
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

const sentiment = (txt: string, tokenizer: Tokenizer = 'WordTokenizer', stemmer: Stemmer = 'PorterStemmer'): number => {
  const { SentimentAnalyzer } = require('natural');
  switch (stemmer) {
    case 'LancasterStemmer': {
      const { LancasterStemmer } = require('natural');
      return new SentimentAnalyzer('English', LancasterStemmer, 'afinn').getSentiment(tokenize(txt, tokenizer));
    }
    case 'PorterStemmer': {
      const { PorterStemmer } = require('natural');
      return new SentimentAnalyzer('English', PorterStemmer, 'afinn').getSentiment(tokenize(txt, tokenizer));
    }
    default: {
      throw new Error(`unrecognised stemmer "${stemmer}"`);
    }
  }
};

const tokenizeAndStem = (txt: string, tokenizer: Tokenizer = 'WordTokenizer', stemmer: Stemmer = 'PorterStemmer'): string[] => {
  switch (stemmer) {
    case 'PorterStemmer':
      const { PorterStemmer } = require('natural');
      return tokenize(txt, tokenizer).map((w) => PorterStemmer.stem(w));
    case 'LancasterStemmer':
      const { LancasterStemmer } = require('natural');
      return tokenize(txt, tokenizer).map((w) => LancasterStemmer.stem(w));
    default: {
      throw new Error(`unrecognised stemmer "${stemmer}"`);
    }
  }
};

const distance = (s1: string, s2: string, metric: DistanceMetric = 'LevenshteinDistance'): number => {
  switch (metric) {
    case 'LevenshteinDistance': {
      const { LevenshteinDistance } = require('natural');
      return LevenshteinDistance(s1, s2);
    }
    case 'DamerauLevenshteinDistance': {
      const { DamerauLevenshteinDistance } = require('natural');
      return DamerauLevenshteinDistance(s1, s2);
    }
    case 'JaroWinklerDistance': {
      const { JaroWinklerDistance } = require('natural');
      return JaroWinklerDistance(s1, s2);
    }
    case 'DiceCoefficient': {
      const { DiceCoefficient } = require('natural');
      return DiceCoefficient(s1, s2);
    }
    default: {
      throw new Error(`unrecognised metric "${metric}"`);
    }
  }
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
        return succeed(context, tokenize(req.body.text, req.body.tokenizer));
      }
      case 'stem': {
        return succeed(context, stem(req.body.text, req.body.stemmer));
      }
      case 'match': {
        return succeed(context, match(req.body.text1, req.body.text2));
      }
      case 'distance': {
        return succeed(context, distance(req.body.text1, req.body.text2, req.body.metric));
      }
      case 'sentiment': {
        return succeed(context, sentiment(req.body.text, req.body.tokenizer));
      }
      case 'tokenizeAndStem': {
        return succeed(context, tokenizeAndStem(req.body.text, req.body.tokenizer, req.body.stemmer));
      }
      default: {
        throw new Error(`unrecognised action "${req.body.action}"`);
      }
    }
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
