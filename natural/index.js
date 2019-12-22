const {
  TreebankWordTokenizer,
  LancasterStemmer,
  OrthographyTokenizer,
  WordPunctTokenizer,
  DiceCoefficient,
  LevenshteinDistance,
  DamerauLevenshteinDistance,
  JaroWinklerDistance,
  WordTokenizer,
  SentimentAnalyzer,
  PorterStemmer,
  // Spellcheck,
} = require('natural');

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
      "minLength": 1
    },
    text2: {
      type: 'string',
      "minLength": 1
    },
    text: {
      type: 'string',
      "minLength": 1
    },
  }
};

// /**
//  * @param {string} word
//  * @return {string[]}
//  */
// const spellcheck = word => {
//   const checker = new Spellcheck(require('./dict'));
//   return checker.isCorrect(word) ? [] : checker.getCorrections(word, 2);
// };

/**
 * @param {string} txt
 * @param {'WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer'} [tokenizer]
 * @return {string[]}
 */
const tokenize = (txt, tokenizer = 'WordTokenizer') => {
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
      return LancasterStemmer.stem(word);
    case 'PorterStemmer':
      return PorterStemmer.stem(word);
  }
};

/**
 * @param {string} txt
 * @return {number}
 */
const sentiment = txt => new SentimentAnalyzer('English', PorterStemmer, 'afinn').getSentiment(tokenize(txt));

/**
 * @param {string} txt
 * @param {'WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer'} [tokenizer]
 * @param {'PorterStemmer'|'LancasterStemmer'} [stemmer]
 * @return {string[]}
 */
const tokenizeAndStem = (txt, tokenizer = 'WordTokenizer', stemmer = 'PorterStemmer') => {
  const Stemmer = stemmer === 'PorterStemmer'
    ? new PorterStemmer()
    : new LancasterStemmer();
  return tokenize(txt).map(w => Stemmer.stem(w));
};

/**
 * @param {string} s1
 * @param {string} s2
 * @param {'LevensteinDistance'|'DamerauLevenshteinDistance'|'JaroWinklerDistance'|'DiceCoefficient'} [metric]
 * @return {number}
 */
const distance = (s1, s2, metric = 'LevenshteinDistance') => {
  switch (metric) {
    case 'LevenshteinDistance':
      return LevenshteinDistance(s1, s2);
    case 'DamerauLevenshteinDistance':
      return DamerauLevenshteinDistance(s1, s2);
    case 'JaroWinklerDistance':
      return JaroWinklerDistance(s1, s2);
    case 'DiceCoefficient':
      return DiceCoefficient(s1, s2);
  }
};

/**
 * @param {string} s1
 * @param {string} s2
 * @return {{substring: string, distance: number}}
 */
const match = (s1, s2) => LevenshteinDistance(s1, s2, {search: true});

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
        return succeed(context, tokenize(req.body.text, req.body.tokenizer || 'WordTokenizer'))
      }
      case 'stem': {
        return succeed(context, stem(req.body.text, req.body.stemmer || 'PorterStemmer'));
      }
      case 'match': {
        return succeed(context, match(req.body.text1, req.body.text2));
      }
      case 'distance': {
        return succeed(context, distance(req.body.text1, req.body.text2, req.body.metric || 'LevenshteinDistance'));
      }
      case 'sentiment': {
        return succeed(context, sentiment(req.body.text));
      }
      case 'tokenizeAndStem': {
        return succeed(context, tokenizeAndStem(req.body.text, req.body.tokenizer || 'WordTokenizer', req.body.stemmer || 'PorterStemmer'));
      }
      // XXX SLOW
      // case 'spellcheck': {
      //   return succeed(context, spellcheck(req.body.text));
      // }
    }
  } catch (e) {
    return fail(context, e.message, e.code)
  }
};
