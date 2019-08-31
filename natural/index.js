const { basename } = require('path');
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
        Spellcheck,
      }            = require('natural');

/**
 * @param {string} word
 * @return {string[]}
 */
function spellcheck(word) {
  const checker = new Spellcheck(require('./dict'));
  return checker.isCorrect(word) ? [] : checker.getCorrections(word, 2);
}

/**
 * @param {string} txt
 * @param {'WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer'} [tokenizer]
 * @return {string[]}
 */
function tokenize(txt, tokenizer = 'WordTokenizer') {
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
}

/**
 *
 * @param {string} word
 * @param {'PorterStemmer'|'LancasterStemmer'} [stemmer]
 */
function stem(word, stemmer = 'PorterStemmer') {
  switch (stemmer) {
    case 'LancasterStemmer':
      return LancasterStemmer.stem(word);
    case 'PorterStemmer':
      return PorterStemmer.stem(word);
  }
}

/**
 * @param {string} txt
 * @return {number}
 */
function sentiment(txt) {
  return new SentimentAnalyzer('English', PorterStemmer, 'afinn').getSentiment(tokenize(txt));
}

/**
 * @param {string} txt
 * @param {'WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer'} [tokenizer]
 * @param {'PorterStemmer'|'LancasterStemmer'} [stemmer]
 * @return {string[]}
 */
function tokenizeAndStem(txt, tokenizer = 'WordTokenizer', stemmer = 'PorterStemmer') {
  const Stemmer = stemmer === 'PorterStemmer'
    ? new PorterStemmer()
    : new LancasterStemmer();
  return tokenize(txt).map(w => Stemmer.stem(w));
}

/**
 * @param {string} s1
 * @param {string} s2
 * @param {'LevenshteinDistance'|'DamerauLevenshteinDistance'|'JaroWinklerDistance'|'DiceCoefficient'} [metric]
 * @return {number}
 */
function distance(s1, s2, metric = 'LevenshteinDistance') {
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
}

/**
 * @param {string} s1
 * @param {string} s2
 * @return {{substring: string, distance: number}}
 */
function match(s1, s2) {
  return LevenshteinDistance(s1, s2, { search: true });
}

const ok = {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'private, immutable',
  },
};

const bad = {
  status: 400,
  headers: {
    'Content-Type': 'text/plain',
  },
  body: `Please pass text in the request body and choose from actions`,
};

/**
 * @param {{res: *, log: Function<...*, void>}} context
 * @param {{originalUrl: string, body: {action: ('stem'|'tokenize'|'match'|'tokenizeAndStem'|'distance'|'natural'|'spellcheck'|'sentiment'), text: string, text1: string, text2: string, metric: ('LevenshteinDistance'|'DamerauLevenshteinDistance'|'JaroWinklerDistance'|'DiceCoefficient'), stemmer: ('PorterStemmer'|'LancasterStemmer'), tokenizer: ('WordPunctTokenizer'|'WordTokenizer'|'TreebankWordTokenizer'|'WordTokenizer'|'OrthographyTokenizer')}}} req
 * @return {Promise<void>}
 */
module.exports = async function (context, req) {
  context.log('[Node.js HTTP %s FuncApp] %s', basename(__dirname), req.originalUrl);

  if (req.body && req.body.action) {
    switch (req.body.action) {
      case 'tokenize': {
        ok.body = JSON.stringify(tokenize(req.body.text, req.body.tokenizer || 'WordTokenizer'));
        break;
      }
      case 'stem': {
        ok.body = JSON.stringify(stem(req.body.text, req.body.stemmer || 'PorterStemmer'));
        break;
      }
      case 'match': {
        ok.body = JSON.stringify(match(req.body.text1, req.body.text2));
        break;
      }
      case 'distance': {
        ok.body = JSON.stringify(distance(req.body.text1, req.body.text2, req.body.metric || 'LevenshteinDistance'));
        break;
      }
      case 'sentiment': {
        ok.body = JSON.stringify(sentiment(req.body.text));
        break;
      }
      case 'tokenizeAndStem': {
        ok.body = JSON.stringify(tokenizeAndStem(req.body.text,
                                                 req.body.tokenizer || 'WordTokenizer',
                                                 req.body.stemmer || 'PorterStemmer',
        ));
        break;
      }
      case 'spellcheck': {
        ok.body = JSON.stringify(spellcheck(req.body.text));
        break;
      }
      default:
        context.res = bad;
        return;
    }
    context.res = ok;

  } else {
    context.res = bad;
  }
};
