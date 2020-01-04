export default {
  $id: 'natural',
  type: 'object',
  required: ['action'],
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
      ],
    },
    stemmer: {
      enum: [
        'LancasterStemmer',
        'PorterStemmer',
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
    flags: {
      type: 'string',
      minLength: 1,
    },
    regex: {
      type: 'string',
      minLength: 1,
    },
    tokenizer: {
      enum: [
        'OrthographyTokenizer',
        'RegexpTokenizer',
        'TreebankWordTokenizer',
        'WordPunctTokenizer',
        'WordTokenizer',
      ],
    },
    text1: {
      type: 'string',
      minLength: 1,
    },
    text2: {
      type: 'string',
      minLength: 1,
    },
    text: {
      type: 'string',
      minLength: 1,
    },
  },
};
