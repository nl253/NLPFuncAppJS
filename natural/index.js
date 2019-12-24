const { succeed, fail, validateJSON, logStart } = require('../lib');

const schema = {
  $id: __dirname,
  type: 'object',
  required: ["action"],
  additionalItems: true,
  properties: {
    action: {
      enum: [
        'distance',
        'match',
        'sentiment',
        'stem',
        'tokenize',
        'tokenizeAndStem',
      ]
    },
    stemmer: {
      enum: [
        'PorterStemmer',
        'LancasterStemmer',
      ],
    },
    metric: {
      enum: [
        'DamerauLevenshteinDistance',
        'DiceCoefficient',
        'JaroWinklerDistance',
        'LevensteinDistance',
      ],
    },
    tokenizer: {
      enum: [
        'OrthographyTokenizer',
        'TreebankWordTokenizer',
        'WordPunctTokenizer',
        'WordTokenizer',
      ],
    },
    text1: {
      type: 'string',
      minLength: 1
    },
    text2: {
      type: 'string',
      "minLength": 1
    },
    text: {
      type: 'string',
      minLength: 1
    },
  }
};

/**
 * @param {string} txt
 * @param {'WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer'} [tokenizer]
 * @return {string[]}
 */
const tokenize = (txt, tokenizer = 'WordTokenizer') => {
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
  }
};

/**
 *
 * @param {string} word
 * @param {'PorterStemmer'|'LancasterStemmer'} [stemmer]
 */
const stem = (word, stemmer = 'PorterStemmer') => {
  switch (stemmer) {
    case 'LancasterStemmer':
      const {LancasterStemmer} = require('natural');
      return LancasterStemmer.stem(word);
    case 'PorterStemmer':
      const {PorterStemmer} = require('natural');
      return PorterStemmer.stem(word);
  }
};

/**
 * @param {string} txt
 * @param {'WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer'} [tokenizer]
 * @param {'PorterStemmer'|'LancasterStemmer'} [stemmer]
 * @return {number}
 */
const sentiment = (txt, tokenizer = 'WordTokenizer', stemmer = 'PorterStemmer') => {
  const {SentimentAnalyzer} = require('natural');
  switch (stemmer) {
    case 'LancasterStemmer':
      const {LancasterStemmer} = require('natural');
      return new SentimentAnalyzer('English', LancasterStemmer, 'afinn').getSentiment(tokenize(txt, tokenizer));
    case 'PorterStemmer':
      const {PorterStemmer} = require('natural');
      return new SentimentAnalyzer('English', PorterStemmer, 'afinn').getSentiment(tokenize(txt, tokenizer));
  }
};

/**
 * @param {string} txt
 * @param {'WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer'} [tokenizer]
 * @param {'PorterStemmer'|'LancasterStemmer'} [stemmer]
 * @return {string[]}
 */
const tokenizeAndStem = (txt, tokenizer = 'WordTokenizer', stemmer = 'PorterStemmer') => {
  switch (stemmer) {
    case 'PorterStemmer':
      const {PorterStemmer} = require('natural');
      return tokenize(txt, tokenizer).map(w => PorterStemmer.stem(w));
    case 'LancasterStemmer':
      const {LancasterStemmer} = require('natural');
      return tokenize(txt, tokenizer).map(w => LancasterStemmer.stem(w));
  }
};

/**
 * @param {string} s1
 * @param {string} s2
 * @param {'LevenshteinDistance'|'DamerauLevenshteinDistance'|'JaroWinklerDistance'|'DiceCoefficient'} [metric]
 * @return {number}
 */
const distance = (s1, s2, metric = 'LevenshteinDistance') => {
  switch (metric) {
    case 'LevenshteinDistance':
      const {LevenshteinDistance} = require('natural');
      return LevenshteinDistance(s1, s2);
    case 'DamerauLevenshteinDistance':
      const {DamerauLevenshteinDistance} = require('natural');
      return DamerauLevenshteinDistance(s1, s2);
    case 'JaroWinklerDistance':
      const {JaroWinklerDistance} = require('natural');
      return JaroWinklerDistance(s1, s2);
    case 'DiceCoefficient':
      const {DiceCoefficient} = require('natural');
      return DiceCoefficient(s1, s2);
  }
};

/**
 * @param {string} s1
 * @param {string} s2
 * @return {{substring: string, distance: number}}
 */
const match = (s1, s2) => {
  const {LevenshteinDistance} = require('natural');
  return LevenshteinDistance(s1, s2, {search: true});
};

/**
 * @param {{res: *, log: Function<...*, void>}} context
 * @param {{originalUrl: string, body: {action: ('stem'|'tokenize'|'match'|'tokenizeAndStem'|'distance'|'natural'|'sentiment'), text: string, text1: string, text2: string, metric: ('LevenshteinDistance'|'DamerauLevenshteinDistance'|'JaroWinklerDistance'|'DiceCoefficient'), stemmer: ('PorterStemmer'|'LancasterStemmer'), tokenizer: ('WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer')}}} req
 * @return {Promise<void>}
 */
module.exports = async (context, req) => {
  logStart(context);

  try {
    await validateJSON(context, schema);

    switch (req.body.action) {
      case 'tokenize': {
        return succeed(context, tokenize(req.body.text, req.body.tokenizer))
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
    }
  } catch (e) {
    return fail(context, e.message, e.code)
  }
};
