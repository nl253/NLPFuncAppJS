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
