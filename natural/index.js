const { basename, join, resolve } = require('path');
const fs = require('fs');
const {
  DiceCoefficient,
  LevenshteinDistance,
  DamerauLevenshteinDistance,
  JaroWinklerDistance,
  WordTokenizer,
  SentimentAnalyzer,
  PorterStemmer,
  Spellcheck,
} = require('natural');

/**
 * @param {string} word
 * @return {string[]}
 */
function spellcheck(word) {
  /** @type {string} */
  const corpus = fs.readFileSync(resolve(join(__dirname, '..', 'frequent.dict')), { encoding: 'utf-8' });
  const words = corpus.split('\n');
  const checker = new Spellcheck(words);
  return checker.isCorrect(word) ? [] : checker.getCorrections(word, 2);
}

/**
 * @param {string} txt
 * @return {string[]}
 */
function tokenize(txt) {
  return new WordTokenizer().tokenize(txt);
}

/**
 * @param {string} txt
 * @return {number}
 */
function sentiment(txt) {
  return new SentimentAnalyzer("English", PorterStemmer, "afinn").getSentiment(tokenize(txt));
}

/**
 * @param {string} txt
 * @return {string[]}
 */
function tokenizeAndStem(txt) {
  const stemmer = new PorterStemmer();
  return tokenize(txt).map(w => stemmer.stem(w));
}

/**
 * @param {string} s1
 * @param {string} s2
 * @param {'LevenshteinDistance'|'DamerauLevenshteinDistance'|'JaroWinklerDistance'|'DiceCoefficient'} metric
 * @return {number}
 */
function distance(s1, s2, metric = 'LevenshteinDistance') {
  switch (metric) {
    case 'LevenshteinDistance': return LevenshteinDistance(s1, s2);
    case 'DamerauLevenshteinDistance': return DamerauLevenshteinDistance(s1, s2);
    case 'JaroWinklerDistance': return JaroWinklerDistance(s1, s2);
    case 'DiceCoefficient': return DiceCoefficient(s1, s2);
  }
}

/**
 * @param {string} s1
 * @param {string} s2
 * @return {string}
 */
function match(s1, s2) {
  return LevenshteinDistance(s1, s2, {search: true});
}

const actions = {
  tokenize,
  sentiment,
  tokenizeAndStem,
  distance,
  spellcheck,
  match,
};
const actionNames = new Set(Object.keys(actions));

const ok = {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
  },
};

const bad = {
  status: 400,
  headers: {
    'Content-Type': 'text/plain',
  },
  body: `Please pass text in the request body and choose from actions: {${[...actionNames].join(', ')}}`,
};

/**
 * @param {{res: *, log: Function<...*, void>}} context
 * @param {{originalUrl: string, body: {action: ('tokenize'|'match'|'tokenizeAndStem'|'distance'|'natural'|'spellcheck'|'sentiment'), text: string, text1: string, text2: string, metric: ('LevenshteinDistance'|'DamerauLevenshteinDistance'|'JaroWinklerDistance'|'DiceCoefficient')}}} req
 * @return {Promise<void>}
 */
module.exports = async function (context, req) {
  context.log('[Node.js HTTP %s FuncApp] %s', basename(__dirname), req.originalUrl);

  if (req.body && req.body.action && actionNames.has(req.body.action)) {

    switch (req.body.action) {
      case 'tokenize': {
        ok.body = JSON.stringify(actions.tokenize(req.body.text));
        break;
      }
      case 'match': {
        ok.body = JSON.stringify(actions.match(req.body.text1, req.body.text2));
        break;
      }
      case 'distance': {
        ok.body = JSON.stringify(actions.distance(req.body.text1, req.body.text2, req.body.metric || 'LevenshteinDistance'));
        break;
      }
      case 'sentiment': {
        ok.body = JSON.stringify(actions.sentiment(req.body.text));
        break;
      }
      case 'tokenizeAndStem': {
        ok.body = JSON.stringify(actions.tokenizeAndStem(req.body.text));
        break;
      }
      case 'spellcheck': {
        ok.body = JSON.stringify(actions.spellcheck(req.body.text));
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
